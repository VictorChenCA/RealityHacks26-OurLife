import SwiftUI

@main
struct SeniorCareApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    @State private var currentScreen: Screen = .home
    
    enum Screen {
        case home, reminders, memories
    }
    
    var body: some View {
        ZStack {
            Color(red: 0.97, green: 0.98, blue: 1.0)
                .ignoresSafeArea()
            
            switch currentScreen {
            case .home:
                HomeView(onNavigate: { screen in currentScreen = screen })
            case .reminders:
                RemindersView(onNavigate: { screen in currentScreen = screen })
            case .memories:
                MemoriesView(onNavigate: { screen in currentScreen = screen })
            }
        }
    }
}
