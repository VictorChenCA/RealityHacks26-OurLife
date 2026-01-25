using UnityEngine;

public class SpatialCarousel : MonoBehaviour
{
    [Header("旋转配置")]
    [SerializeField] private float _rotationStep = 120f;
    [SerializeField] private float _smoothTime = 0.25f; // 缩短时间让反馈更快
    [SerializeField] private bool _autoAlignChildren = true;

    private float _targetYRotation = 0f;
    private float _currentYRotation = 0f;
    private float _rotationVelocity = 0f;

    public void ScrollLeft() => _targetYRotation += _rotationStep;
    public void ScrollRight() => _targetYRotation -= _rotationStep;

    private void Start()
    {
        // 核心修正：不管你在编辑器里把它放哪，运行时强制归零
        // 这样旋转轴心就绝对是世界原点 (0,0,0)
        transform.position = Vector3.zero;
    }

    private void Update()
    {
        // 平滑旋转容器
        _currentYRotation = Mathf.SmoothDampAngle(
            _currentYRotation,
            _targetYRotation,
            ref _rotationVelocity,
            _smoothTime
        );
        // transform.rotation = Quaternion.Euler(0, _currentYRotation, 0);

        if (_autoAlignChildren)
        {
            foreach (Transform child in transform)
            {
                // 1. 让子物体看向中心点
                // child.LookAt(Vector3.zero);

                // 2. 修正 Plane 的旋转偏移
                // 因为你的 Plane 初始 X 是 -90
                // LookAt 会让 Z 轴指向中心，我们需要补回 X 轴的偏转让正面 (Y轴) 对着中心
                // child.Rotate(0, 0, 0, Space.Self);
            }
        }
    }
}