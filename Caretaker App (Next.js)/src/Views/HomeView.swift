import SwiftUI

struct HomeView: View {
    let onNavigate: (ContentView.Screen) -> Void
    
    @State private var isSettingsOpen = false
    @State private var selectedTask: Task?
    @State private var showTaskDetail = false
    @State private var selectedDate: Int? = 4
    @State private var tasks: [Task] = [
        Task(
            id: "1",
            title: "Church & Lunch",
            location: "@123 Church Ave",
            time: "11:00AM",
            endTime: "2:00PM",
            frequency: "🔁 Every Sunday",
            description: "Weekly church service followed by lunch with congregation members.",
            category: .social,
            backgroundColor: Color(red: 0.88, green: 0.93, blue: 0.98),
            frequencyColor: Color(red: 0.11, green: 0.19, blue: 0.55)
        ),
        Task(
            id: "2",
            title: "Cleaning Lady's Visit",
            location: "@home",
            time: "4:00PM",
            endTime: "6:00PM",
            frequency: "🔁 Every other Sunday",
            description: "Maria comes to help clean the house.",
            category: .personal,
            backgroundColor: Color(red: 1.0, green: 0.89, blue: 0.65).opacity(0.1),
            frequencyColor: Color(red: 0.55, green: 0.35, blue: 0.11)
        ),
        Task(
            id: "3",
            title: "Medication",
            location: "@home, bedroom",
            time: "9:00PM",
            endTime: "",
            frequency: "🔁 Every other day",
            description: "Take evening medication before bed.",
            category: .medical,
            backgroundColor: Color(red: 0.47, green: 0.78, blue: 0.62).opacity(0.1),
            frequencyColor: Color(red: 0.15, green: 0.45, blue: 0.26)
        )
    ]
    
    var currentTasks: [Task] {
        guard let date = selectedDate else { return tasks }
        return tasksByDate[date] ?? []
    }
    
    var tasksByDate: [Int: [Task]] {
        [
            4: tasks,
            5: [
                Task(
                    id: "4",
                    title: "Doctor Appointment",
                    location: "@Medical Center",
                    time: "10:00AM",
                    endTime: "11:00AM",
                    frequency: "🔁 Once",
                    description: "Regular checkup with Dr. Johnson.",
                    category: .medical,
                    backgroundColor: Color(red: 0.47, green: 0.78, blue: 0.62).opacity(0.1),
                    frequencyColor: Color(red: 0.15, green: 0.45, blue: 0.26)
                ),
                Task(
                    id: "5",
                    title: "Lunch with Mary",
                    location: "@Olive Garden",
                    time: "12:30PM",
                    endTime: "2:00PM",
                    frequency: "🔁 Once",
                    description: "Meeting daughter Mary for lunch.",
                    category: .social,
                    backgroundColor: Color(red: 0.88, green: 0.93, blue: 0.98),
                    frequencyColor: Color(red: 0.11, green: 0.19, blue: 0.55)
                )
            ],
            6: [
                Task(
                    id: "6",
                    title: "Grocery Shopping",
                    location: "@Neighborhood Mart",
                    time: "9:00AM",
                    endTime: "10:30AM",
                    frequency: "🔁 Every Saturday",
                    description: "Weekly grocery shopping.",
                    category: .errands,
                    backgroundColor: Color(red: 1.0, green: 0.89, blue: 0.65).opacity(0.1),
                    frequencyColor: Color(red: 0.55, green: 0.35, blue: 0.11)
                )
            ]
        ]
    }
    
    var body: some View {
        ZStack {
            Color(red: 0.97, green: 0.98, blue: 1.0)
                .ignoresSafeArea()
            
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Header
                    HStack {
                        Text("Home")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.black)
                        
                        Spacer()
                        
                        Button(action: { isSettingsOpen = true }) {
                            VStack(spacing: 4) {
                                Image(systemName: "gearshape")
                                    .font(.system(size: 24))
                                    .foregroundColor(.black)
                                Text("Setting")
                                    .font(.system(size: 10))
                                    .foregroundColor(.black)
                                    .opacity(0.6)
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 27)
                    .padding(.bottom, 24)
                    
                    // Today Section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Today")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.black)
                            .padding(.horizontal, 16)
                        
                        VStack(spacing: 8) {
                            ForEach(tasks) { task in
                                TaskCardView(task: task) {
                                    selectedTask = task
                                    showTaskDetail = true
                                }
                                .padding(.horizontal, 16)
                            }
                        }
                    }
                    .padding(.bottom, 32)
                    
                    // Weekly Highlights
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Weekly Highlights")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.black)
                            .padding(.horizontal, 16)
                        
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                WeeklyHighlightCard(
                                    imageURL: "https://images.unsplash.com/photo-1600324839804-135dad3a3069",
                                    title: "Lunch at Church"
                                )
                                WeeklyHighlightCard(
                                    imageURL: "https://images.unsplash.com/photo-1617336988198-dabef7cab90d",
                                    title: "Chat with Joe"
                                )
                                WeeklyHighlightCard(
                                    imageURL: "https://images.unsplash.com/photo-1645771321012-919d2e7aa858",
                                    title: "Coffee"
                                )
                                WeeklyHighlightCard(
                                    imageURL: "https://images.unsplash.com/photo-1759588032622-1388cf9505ad",
                                    title: "Mr.Meow's Nap"
                                )
                            }
                            .padding(.horizontal, 16)
                        }
                    }
                    .padding(.bottom, 32)
                    
                    // Coming Up Section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Coming Up")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.black)
                            .padding(.horizontal, 16)
                        
                        CalendarView(selectedDate: $selectedDate)
                            .padding(.horizontal, 16)
                        
                        VStack(spacing: 8) {
                            ForEach(currentTasks) { task in
                                TaskCardView(task: task) {
                                    selectedTask = task
                                    showTaskDetail = true
                                }
                                .padding(.horizontal, 16)
                            }
                        }
                    }
                    .padding(.bottom, 32)
                    
                    // Bottom navigation
                    BottomNavView(currentScreen: .home, onNavigate: onNavigate)
                }
            }
        }
        .sheet(isPresented: $isSettingsOpen) {
            SettingsView()
        }
        .sheet(isPresented: $showTaskDetail) {
            if let task = selectedTask {
                TaskDetailView(task: task, onDelete: { id in
                    tasks.removeAll { $0.id == id }
                }, onClose: { showTaskDetail = false })
            }
        }
    }
}

struct WeeklyHighlightCard: View {
    let imageURL: String
    let title: String
    
    var body: some View {
        VStack(spacing: 2) {
            AsyncImage(url: URL(string: imageURL)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Color.gray.opacity(0.3)
            }
            .frame(width: 86, height: 130)
            .clipShape(RoundedRectangle(cornerRadius: 4))
            
            Text(title)
                .font(.system(size: 10))
                .foregroundColor(.black)
                .frame(width: 86)
                .multilineTextAlignment(.center)
        }
    }
}