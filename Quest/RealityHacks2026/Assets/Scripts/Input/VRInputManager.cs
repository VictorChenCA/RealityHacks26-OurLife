using System;
using UnityEngine;
using UnityEngine.XR;

namespace RealityHacks.Input
{
    public class VRInputManager : MonoBehaviour
    {
        [Header("Input Thresholds")]
        [SerializeField] private float triggerThreshold = 0.8f;
        [SerializeField] private float joystickPressHoldTime = 30f;

        public event Action OnRightTriggerPressed;
        public event Action OnRightTriggerReleased;
        public event Action OnLeftJoystickHeldComplete;
        public event Action<float> OnLeftJoystickHoldProgress;

        private InputDevice rightController;
        private InputDevice leftController;
        private bool rightTriggerWasPressed = false;
        private bool leftJoystickWasPressed = false;
        private float leftJoystickHoldTimer = 0f;
        private bool controllersFound = false;

        public bool IsRightTriggerHeld { get; private set; }
        public bool IsLeftJoystickPressed { get; private set; }

        private void Update()
        {
            if (!controllersFound)
            {
                TryGetControllers();
            }

            if (controllersFound)
            {
                UpdateRightTrigger();
                UpdateLeftJoystick();
            }
        }

        private void TryGetControllers()
        {
            var rightHandDevices = new System.Collections.Generic.List<InputDevice>();
            InputDevices.GetDevicesAtXRNode(XRNode.RightHand, rightHandDevices);
            if (rightHandDevices.Count > 0)
            {
                rightController = rightHandDevices[0];
            }

            var leftHandDevices = new System.Collections.Generic.List<InputDevice>();
            InputDevices.GetDevicesAtXRNode(XRNode.LeftHand, leftHandDevices);
            if (leftHandDevices.Count > 0)
            {
                leftController = leftHandDevices[0];
            }

            controllersFound = rightController.isValid && leftController.isValid;
            
            if (controllersFound)
            {
                Debug.Log("[VRInputManager] Controllers found and ready");
            }
        }

        private void UpdateRightTrigger()
        {
            float triggerValue = 0f;
            if (rightController.TryGetFeatureValue(CommonUsages.trigger, out triggerValue))
            {
                bool isPressed = triggerValue >= triggerThreshold;
                IsRightTriggerHeld = isPressed;

                if (isPressed && !rightTriggerWasPressed)
                {
                    OnRightTriggerPressed?.Invoke();
                    Debug.Log("[VRInputManager] Right trigger pressed");
                }
                else if (!isPressed && rightTriggerWasPressed)
                {
                    OnRightTriggerReleased?.Invoke();
                    Debug.Log("[VRInputManager] Right trigger released");
                }

                rightTriggerWasPressed = isPressed;
            }
        }

        private void UpdateLeftJoystick()
        {
            bool joystickPressed = false;
            if (leftController.TryGetFeatureValue(CommonUsages.primary2DAxisClick, out joystickPressed))
            {
                IsLeftJoystickPressed = joystickPressed;

                if (joystickPressed)
                {
                    if (!leftJoystickWasPressed)
                    {
                        leftJoystickHoldTimer = 0f;
                        Debug.Log("[VRInputManager] Left joystick press started");
                    }

                    leftJoystickHoldTimer += Time.deltaTime;
                    float progress = leftJoystickHoldTimer / joystickPressHoldTime;
                    OnLeftJoystickHoldProgress?.Invoke(progress);

                    if (leftJoystickHoldTimer >= joystickPressHoldTime)
                    {
                        OnLeftJoystickHeldComplete?.Invoke();
                        leftJoystickHoldTimer = 0f;
                        Debug.Log("[VRInputManager] Left joystick held for required time");
                    }
                }
                else
                {
                    if (leftJoystickWasPressed && leftJoystickHoldTimer > 0)
                    {
                        Debug.Log($"[VRInputManager] Left joystick released early at {leftJoystickHoldTimer:F1}s");
                    }
                    leftJoystickHoldTimer = 0f;
                }

                leftJoystickWasPressed = joystickPressed;
            }
        }

        public void SetJoystickHoldTime(float seconds)
        {
            joystickPressHoldTime = seconds;
        }
    }
}
