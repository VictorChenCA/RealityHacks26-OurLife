# Senior Care App - Swift/SwiftUI Version

A comprehensive iOS app designed for caregivers helping family members with dementia. Built with SwiftUI for native iOS performance.

## 🎯 Features

### Home Screen
- **Today's Schedule**: View all tasks and reminders for the current day
- **Weekly Highlights**: Photo gallery of recent activities and memories
- **Coming Up Calendar**: Interactive calendar with task management
- **Task Management**: Tap any task to view details, edit, or delete

### Reminders Screen
- **Interactive House Map**: Visual representation with location pins
- **Location-Based Hints**: Tap pins to see reminder alerts for specific rooms
- **Add Hints**: Floating action button to create new location reminders
- **Color-Coded Alerts**: Red alerts when pins are activated

### Memories Screen
- **Recent Memories**: Scrollable photo gallery of recent events
- **Family & Friends**: List of important people with detailed profiles
- **Person Profiles**: 
  - View relationships and personal details
  - Age and interests
  - Important facts to remember
  - Shared memories gallery
  - Easy navigation with back button

### Settings
- User profile information
- Notification preferences
- Privacy settings
- Help & Support

## 📱 Technical Details

### Architecture
- **SwiftUI**: Modern declarative UI framework
- **MVVM Pattern**: Separation of concerns with models and views
- **State Management**: Using @State, @Binding, and @Environment
- **Navigation**: Sheet-based navigation for modals
- **Async Image Loading**: Network images with AsyncImage

### Key Components

#### Models
- `Task.swift`: Task data model with categories and styling
- `PersonProfile.swift`: Person profile data with memories

#### Views
- `HomeView.swift`: Main dashboard with schedule
- `RemindersView.swift`: Interactive house map
- `MemoriesView.swift`: Photo gallery and people list
- `PersonProfileView.swift`: Detailed person information

#### Components
- `TaskCardView.swift`: Reusable task card
- `CalendarView.swift`: Interactive month calendar
- `BottomNavView.swift`: Bottom navigation bar
- `SettingsView.swift`: Settings modal
- `TaskDetailView.swift`: Task detail modal
- `AddHintView.swift`: Form to add location hints

### Design System
- **Colors**: Light blue background (#F7FBFF) for calmness
- **Typography**: System font with clear hierarchy
- **Spacing**: Consistent 8px grid system
- **Accessibility**: Large text and touch targets for seniors
- **Animations**: Smooth transitions and button interactions

## 🚀 Getting Started

### Requirements
- iOS 16.0+
- Xcode 15.0+
- Swift 5.9+

### Installation

1. Clone or download the project
2. Open the project in Xcode
3. Select your target device or simulator
4. Press Cmd+R to build and run

### Project Structure
```
SeniorCareApp/
├── SeniorCareApp.swift          # App entry point
├── Models/
│   ├── Task.swift               # Task model
│   └── PersonProfile.swift      # Person profile model
├── Views/
│   ├── HomeView.swift           # Home screen
│   ├── RemindersView.swift      # Reminders screen
│   └── MemoriesView.swift       # Memories screen
└── Components/
    ├── TaskCardView.swift       # Task card component
    ├── CalendarView.swift       # Calendar component
    ├── BottomNavView.swift      # Navigation bar
    ├── SettingsView.swift       # Settings modal
    ├── TaskDetailView.swift     # Task detail modal
    ├── AddHintView.swift        # Add hint form
    └── PersonProfileView.swift  # Person profile view
```

## 🎨 Customization

### Adding New Tasks
Edit the `tasks` array in `HomeView.swift`:
```swift
Task(
    id: "unique-id",
    title: "Task Name",
    location: "@Location",
    time: "10:00AM",
    endTime: "11:00AM",
    frequency: "🔁 Daily",
    description: "Task description",
    category: .social,
    backgroundColor: Color.blue.opacity(0.1),
    frequencyColor: Color.blue
)
```

### Adding New People
Edit `PersonProfile.swift` to add new person profiles with their memories and details.

### Changing Colors
Update color values throughout the app:
- Background: `Color(red: 0.97, green: 0.98, blue: 1.0)`
- Accent: `Color.blue`
- Task backgrounds: Customizable per task

## 🔧 Advanced Features

### Image Loading
Images are loaded asynchronously from URLs using SwiftUI's `AsyncImage`:
- Automatic placeholder while loading
- Error handling with fallback colors
- Memory efficient caching

### State Management
- Local state with `@State` for simple values
- Bindings with `@Binding` for parent-child communication
- Environment with `@Environment` for system values

### Navigation
- Sheet-based modals for overlays
- Conditional rendering for profile views
- Custom back navigation for person profiles

## 📝 Notes

- Images are fetched from Unsplash URLs
- Task data is stored in-memory (add persistence with Core Data or UserDefaults)
- Calendar shows January 2026 by default
- Bottom navigation has gradient fade effect
- All interactions are optimized for senior users with larger touch targets

## 🤝 Contributing

This is a template project designed for caregivers. Feel free to customize it for your specific needs:
- Add medication reminders
- Integrate with calendar apps
- Add photo upload functionality
- Implement data persistence
- Add sharing features for family members

## 📄 License

This project is provided as-is for personal and educational use.

## 💡 Tips for Caregivers

1. **Simplicity First**: Keep the interface clean and uncluttered
2. **Large Text**: Ensure all text is readable for seniors
3. **High Contrast**: Use clear visual distinctions
4. **Consistent Layout**: Keep navigation predictable
5. **Positive Reinforcement**: Use encouraging language
6. **Regular Updates**: Keep photos and memories current

## 🆘 Support

For issues or questions about Swift/SwiftUI development:
- Apple Developer Documentation
- SwiftUI Tutorials
- iOS Developer Forums

---

Built with ❤️ for caregivers and their loved ones.
