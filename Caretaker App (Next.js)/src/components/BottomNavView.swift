import SwiftUI

struct BottomNavView: View {
    let currentScreen: ContentView.Screen
    let onNavigate: (ContentView.Screen) -> Void
    
    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.97, green: 0.98, blue: 1.0).opacity(0),
                    Color(red: 0.97, green: 0.98, blue: 1.0).opacity(0.8),
                    Color(red: 0.97, green: 0.98, blue: 1.0)
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
            .frame(height: 80)
            
            HStack(spacing: 0) {
                Spacer()
                
                // Home
                Button(action: { onNavigate(.home) }) {
                    VStack(spacing: 4) {
                        Image(systemName: "house")
                            .font(.system(size: 24))
                            .foregroundColor(.black)
                        Text("Home")
                            .font(.system(size: 10, weight: currentScreen == .home ? .bold : .regular))
                            .foregroundColor(.black)
                            .opacity(0.6)
                    }
                }
                .frame(width: 60)
                
                Spacer()
                
                // Reminders
                Button(action: { onNavigate(.reminders) }) {
                    VStack(spacing: 4) {
                        Image(systemName: "calendar.badge.clock")
                            .font(.system(size: 24))
                            .foregroundColor(.black)
                        Text("Reminders")
                            .font(.system(size: 10, weight: currentScreen == .reminders ? .bold : .regular))
                            .foregroundColor(.black)
                            .opacity(0.6)
                    }
                }
                .frame(width: 80)
                
                Spacer()
                
                // Memories
                Button(action: { onNavigate(.memories) }) {
                    VStack(spacing: 4) {
                        Image(systemName: "heart.circle")
                            .font(.system(size: 24))
                            .foregroundColor(.black)
                        Text("Memories")
                            .font(.system(size: 10, weight: currentScreen == .memories ? .bold : .regular))
                            .foregroundColor(.black)
                            .opacity(0.6)
                    }
                }
                .frame(width: 60)
                
                Spacer()
            }
            .padding(.top, 20)
        }
        .frame(height: 80)
    }
}