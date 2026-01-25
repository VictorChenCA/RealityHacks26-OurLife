import SwiftUI

struct TaskCardView: View {
    let task: Task
    let onClick: () -> Void
    
    var body: some View {
        Button(action: onClick) {
            HStack(spacing: 12) {
                // Time
                Text(task.time)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.black)
                    .frame(width: 60, alignment: .leading)
                
                // Task Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(task.title)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.black)
                    
                    HStack(spacing: 4) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.system(size: 10))
                            .foregroundColor(.gray)
                        Text(task.location)
                            .font(.system(size: 10))
                            .foregroundColor(.gray)
                    }
                    
                    if !task.endTime.isEmpty {
                        HStack(spacing: 4) {
                            Image(systemName: "clock.fill")
                                .font(.system(size: 10))
                                .foregroundColor(.gray)
                            Text("\(task.time) - \(task.endTime)")
                                .font(.system(size: 10))
                                .foregroundColor(.gray)
                        }
                    }
                    
                    Text(task.frequency)
                        .font(.system(size: 10))
                        .foregroundColor(task.frequencyColor)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 14))
                    .foregroundColor(.gray)
            }
            .padding(12)
            .background(task.backgroundColor)
            .cornerRadius(8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}
