# -------- Config (override via: make android AVD=Pixel_7_API_34) --------
SHELL := /bin/bash
AVD ?= Medium_Phone_API_36.0
METRO_PORT ?= 8081
ADB ?= adb
EMULATOR ?= $(shell command -v emulator 2>/dev/null || echo $(HOME)/Library/Android/sdk/emulator/emulator)

# -------- Helpers --------
.PHONY: help
help:
	@echo "Targets:"
	@echo "  make android        - Build & run on emulator (auto-starts one if needed)"
	@echo "  make device         - Build & run on a connected physical device"
	@echo "  make metro          - Start Metro (if not already running)"
	@echo "  make clean          - Free port $(METRO_PORT)"
	@echo "  make gradlew-fix    - chmod +x android/gradlew"
	@echo "  make kill-emulators - Stop all running emulators"


# -------- Core --------
# ENOTEMPTY rmdir is an npm install glitch: npm tried to remove a package folder during install, but there were leftover files
.PHONY: nuke
nuke:
	@echo "Deep cleaning node, caches, and Android build artifacts..."
	@pkill -f "node .*metro" 2>/dev/null || true
	@watchman watch-del-all 2>/dev/null || true
	@rm -rf node_modules package-lock.json
	@npm cache clean --force
	@cd android && ./gradlew clean || true
	@rm -rf android/.gradle android/build android/app/build


# -------- Update lock file --------
.PHONY: update-lock
update-lock:
	@echo "Regenerating package-lock.json from package.json..."
	npm install --package-lock-only


# -------- Core --------
.PHONY: setup
setup:
	@echo "Installing Node.js dependencies..."
	@if [ -f package-lock.json ]; then \
		npm ci --no-audit --no-fund || ( \
			echo "npm ci failed; nuking node_modules and retrying..."; \
			rm -rf node_modules; \
			npm ci --no-audit --no-fund \
		); \
	else \
		npm install --no-audit --no-fund; \
	fi



.PHONY: clean
clean:
	@echo "Freeing port $(METRO_PORT) (if used)..."
	@kill -9 $$(lsof -ti:$(METRO_PORT)) 2>/dev/null || true

.PHONY: gradlew-fix
gradlew-fix:
	@chmod +x android/gradlew || true

# Start an emulator if none online; otherwise no-op
.PHONY: ensure-emulator
ensure-emulator:
	@echo "Ensuring an Android emulator is online..."
	@if $(ADB) devices | awk 'NR>1 && $$2=="device" && $$1 ~ /^emulator-/' | grep -q .; then \
		echo "Emulator already online."; \
	else \
		echo "Launching emulator @$(AVD) ..."; \
		"$(EMULATOR)" @$(AVD) -netdelay none -netspeed full -no-snapshot-load >/dev/null 2>&1 & \
	fi

# Block until booted (emulator only)
.PHONY: wait-boot
wait-boot:
	@echo "Waiting for emulator to appear as a device..."
	@until $(ADB) devices | awk 'NR>1 && $$2=="device" && $$1 ~ /^emulator-/' | grep -q .; do sleep 2; done
	@echo "Waiting for Android system boot to complete..."
	@until [ "$$($(ADB) shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do sleep 2; done
	@echo "Emulator ready."

# One command to do the thing on emulator
# Start Metro only if not already on 8081
.PHONY: metro
metro:
	@if lsof -ti:8081 >/dev/null 2>&1; then \
		echo "Metro already running on 8081"; \
	else \
		echo "Starting Metro on 8081..."; \
		npm start & \
		sleep 2; \
	fi

# Android: reuse Metro, never start a second one
.PHONY: android
android: metro
	npx react-native run-android --no-packager

# iOS: reuse Metro, never start a second one
.PHONY: ios
ios: metro
	RCT_NO_LAUNCH_PACKAGER=1 npx react-native run-ios



# One command to do the thing on a physical device
.PHONY: device
device: setup gradlew-fix clean metro
	@echo "Checking for a physical Android device..."
	@if ! $(ADB) devices | awk 'NR>1 && $$2=="device" && $$1 !~ /^emulator-/' | grep -q .; then \
		echo "No physical device detected. Run 'adb devices' to verify."; exit 1; \
	fi
	@echo "Installing app on physical device..."
	npm run android

# Utilities
.PHONY: kill-emulators
kill-emulators:
	@echo "Stopping all running emulators..."
	@$(ADB) devices | awk 'NR>1 && $$1 ~ /^emulator-/' | while read -r dev state; do \
		echo "Stopping $$dev ..."; $(ADB) -s $$dev emu kill || true; \
	done
