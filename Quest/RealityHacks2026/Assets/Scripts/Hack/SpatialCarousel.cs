using UnityEngine;

public class SpatialCarousel : MonoBehaviour
{
    [Header("旋转配置")]
    [SerializeField] private float _rotationStep = 120f; // 三张画布，每步旋转 120 度
    [SerializeField] private float _smoothTime = 0.3f;   // 旋转平滑时间

    private float _targetYRotation = 0f;
    private float _currentYRotation = 0f;
    private float _rotationVelocity = 0f;

    // 向左挥手：画布向左转（顺时针旋转容器）
    public void ScrollLeft()
    {
        _targetYRotation += _rotationStep;
    }

    // 向右挥手：画布向右转（逆时针旋转容器）
    public void ScrollRight()
    {
        _targetYRotation -= _rotationStep;
    }

    private void Update()
    {
        // 使用 SmoothDamp 实现平滑的物理旋转感
        _currentYRotation = Mathf.SmoothDampAngle(
            _currentYRotation,
            _targetYRotation,
            ref _rotationVelocity,
            _smoothTime
        );

        transform.localRotation = Quaternion.Euler(0, _currentYRotation, 0);
    }
}