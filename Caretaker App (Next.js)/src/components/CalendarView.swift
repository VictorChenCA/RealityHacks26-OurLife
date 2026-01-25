import SwiftUI

struct CalendarView: View {
    @Binding var selectedDate: Int?
    @State private var currentMonth = "January"
    @State private var currentYear = 2026
    
    let daysInMonth = 31
    let startDay = 3 // Wednesday
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: {
                    // Previous month logic
                }) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.black)
                }
                
                Spacer()
                
                Text("\(currentMonth) \(currentYear)")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.black)
                
                Spacer()
                
                Button(action: {
                    // Next month logic
                }) {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.black)
                }
            }
            .padding(16)
            
            // Day headers
            HStack(spacing: 0) {
                ForEach(["S", "M", "T", "W", "T", "F", "S"], id: \.self) { day in
                    Text(day)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.gray)
                        .frame(maxWidth: .infinity)
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 8)
            
            // Calendar grid
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 4), count: 7), spacing: 8) {
                // Empty spaces before first day
                ForEach(0..<startDay, id: \.self) { _ in
                    Color.clear
                        .frame(height: 32)
                }
                
                // Days
                ForEach(1...daysInMonth, id: \.self) { day in
                    Button(action: {
                        selectedDate = day
                    }) {
                        Text("\(day)")
                            .font(.system(size: 14))
                            .foregroundColor(selectedDate == day ? .white : .black)
                            .frame(width: 32, height: 32)
                            .background(selectedDate == day ? Color.blue : Color.clear)
                            .clipShape(Circle())
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 16)
        }
        .background(Color.white)
        .cornerRadius(8)
        .shadow(color: Color.black.opacity(0.12), radius: 4, x: 0, y: 4)
    }
}
