import SwiftUI

struct TaskDetailView: View {
    let task: Task
    let onDelete: (String) -> Void
    let onClose: () -> Void
    @State private var showDeleteAlert = false
    
    var body: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: 24) {
                // Title
                Text(task.title)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.black)
                    .padding(.top, 16)
                
                // Location
                HStack(spacing: 8) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.blue)
                    Text(task.location)
                        .font(.system(size: 16))
                        .foregroundColor(.black)
                }
                
                // Time
                HStack(spacing: 8) {
                    Image(systemName: "clock.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.blue)
                    if !task.endTime.isEmpty {
                        Text("\(task.time) - \(task.endTime)")
                            .font(.system(size: 16))
                            .foregroundColor(.black)
                    } else {
                        Text(task.time)
                            .font(.system(size: 16))
                            .foregroundColor(.black)
                    }
                }
                
                // Frequency
                HStack(spacing: 8) {
                    Image(systemName: "repeat")
                        .font(.system(size: 20))
                        .foregroundColor(.blue)
                    Text(task.frequency)
                        .font(.system(size: 16))
                        .foregroundColor(.black)
                }
                
                Divider()
                    .padding(.vertical, 8)
                
                // Description
                VStack(alignment: .leading, spacing: 8) {
                    Text("Description")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.gray)
                    Text(task.description)
                        .font(.system(size: 16))
                        .foregroundColor(.black)
                }
                
                Spacer()
                
                // Action Buttons
                VStack(spacing: 12) {
                    Button(action: {
                        // Edit action
                    }) {
                        Text("Edit Task")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(12)
                    }
                    
                    Button(action: {
                        showDeleteAlert = true
                    }) {
                        Text("Delete Task")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.red)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.white)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.red, lineWidth: 2)
                            )
                            .cornerRadius(12)
                    }
                }
                .padding(.bottom, 32)
            }
            .padding(.horizontal, 16)
            .background(Color(red: 0.97, green: 0.98, blue: 1.0))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Close") {
                        onClose()
                    }
                }
            }
            .alert("Delete Task", isPresented: $showDeleteAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    onDelete(task.id)
                    onClose()
                }
            } message: {
                Text("Are you sure you want to delete this task?")
            }
        }
    }
}
