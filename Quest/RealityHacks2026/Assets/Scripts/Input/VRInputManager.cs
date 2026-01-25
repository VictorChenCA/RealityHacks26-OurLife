using System;
using UnityEngine;
using UnityEngine.InputSystem;

namespace RealityHacks.Input
{
    /// <summary>
    /// VR Input Manager using Unity Input System for Quest controllers.
    /// A button = Record, B button = Toggle Menu
    /// Creates its own input actions at runtime for OpenXR compatibility.
    /// </summary>
    public class VRInputManager : MonoBehaviour
    {
        public event Action OnRightTriggerPressed;  // Fired when A pressed (start recording)
        public event Action OnRightTriggerReleased; // Fired when A released (stop recording)
        public event Action OnLeftJoystickHeldComplete; // Fired when B pressed (toggle menu)
        public event Action<float> OnLeftJoystickHoldProgress; // Not used for B button

        private InputAction aButtonAction;
        private InputAction bButtonAction;
        private InputAction rightJoystickAction;

        private bool aButtonWasPressed = false;
        private bool bButtonWasPressed = false;

        public bool IsRightTriggerHeld { get; private set; }
        public bool IsLeftJoystickPressed { get; private set; }
        public Vector2 RightJoystick { get; private set; }

        private void Awake()
        {
            // Create input actions with multiple binding paths for OpenXR compatibility
            aButtonAction = new InputAction("AButton", InputActionType.Button);
            // Try all possible binding paths for A button
            aButtonAction.AddBinding("<XRController>{RightHand}/primaryButton");
            aButtonAction.AddBinding("<XRController>{RightHand}/buttonA");
            aButtonAction.AddBinding("<OculusTouchController>{RightHand}/primaryButton");
            aButtonAction.AddBinding("<MetaQuestTouchProControllerOpenXR>{RightHand}/primaryButton");
            aButtonAction.AddBinding("<QuestProTouchController>{RightHand}/primaryButton");
            
            bButtonAction = new InputAction("BButton", InputActionType.Button);
            // Try all possible binding paths for B button
            bButtonAction.AddBinding("<XRController>{RightHand}/secondaryButton");
            bButtonAction.AddBinding("<XRController>{RightHand}/buttonB");
            bButtonAction.AddBinding("<OculusTouchController>{RightHand}/secondaryButton");
            bButtonAction.AddBinding("<MetaQuestTouchProControllerOpenXR>{RightHand}/secondaryButton");
            bButtonAction.AddBinding("<QuestProTouchController>{RightHand}/secondaryButton");
            
            // Right joystick for scrolling
            rightJoystickAction = new InputAction("RightJoystick", InputActionType.Value);
            rightJoystickAction.AddBinding("<XRController>{RightHand}/thumbstick");
            rightJoystickAction.AddBinding("<OculusTouchController>{RightHand}/thumbstick");
            rightJoystickAction.AddBinding("<MetaQuestTouchProControllerOpenXR>{RightHand}/thumbstick");

            Debug.Log("[VRInputManager] Created Input Actions for A and B buttons with multiple bindings");
            
            // Log all available devices for debugging
            foreach (var device in UnityEngine.InputSystem.InputSystem.devices)
            {
                Debug.Log($"[VRInputManager] Available device: {device.name} ({device.deviceId})");
            }
        }

        private void OnEnable()
        {
            aButtonAction?.Enable();
            bButtonAction?.Enable();
            rightJoystickAction?.Enable();
            Debug.Log("[VRInputManager] Input actions enabled");
        }

        private void OnDisable()
        {
            aButtonAction?.Disable();
            bButtonAction?.Disable();
            rightJoystickAction?.Disable();
        }

        private void OnDestroy()
        {
            aButtonAction?.Dispose();
            bButtonAction?.Dispose();
            rightJoystickAction?.Dispose();
        }

        private void Update()
        {
            UpdateAButton();
            UpdateBButton();
            UpdateJoystick();
        }

        private void UpdateJoystick()
        {
            if (rightJoystickAction != null)
            {
                RightJoystick = rightJoystickAction.ReadValue<Vector2>();
            }
        }

        private void UpdateAButton()
        {
            bool isPressed = aButtonAction.IsPressed();
            IsRightTriggerHeld = isPressed;

            if (isPressed && !aButtonWasPressed)
            {
                OnRightTriggerPressed?.Invoke();
                Debug.Log("[VRInputManager] A button pressed - start recording");
            }
            else if (!isPressed && aButtonWasPressed)
            {
                OnRightTriggerReleased?.Invoke();
                Debug.Log("[VRInputManager] A button released - stop recording");
            }

            aButtonWasPressed = isPressed;
        }

        private void UpdateBButton()
        {
            bool isPressed = bButtonAction.IsPressed();
            IsLeftJoystickPressed = isPressed;

            if (isPressed && !bButtonWasPressed)
            {
                OnLeftJoystickHeldComplete?.Invoke();
                Debug.Log("[VRInputManager] B button pressed - toggle menu");
            }

            bButtonWasPressed = isPressed;
        }

        public bool AreActionsConfigured()
        {
            bool configured = aButtonAction != null && bButtonAction != null;
            Debug.Log($"[VRInputManager] Using Input System - A=Record, B=Menu, Configured: {configured}");
            return configured;
        }
    }
}
