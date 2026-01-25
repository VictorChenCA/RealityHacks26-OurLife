import SwiftUI

struct RemindersView: View {
    let onNavigate: (ContentView.Screen) -> Void
    
    @State private var isSettingsOpen = false
    @State private var isAddHintOpen = false
    @State private var showPin1Alert = false
    @State private var showPin2Alert = false
    @State private var showPin3Alert = false
    @State private var showPin4Alert = false
    
    var body: some View {
        ZStack {
            Color(red: 0.97, green: 0.98, blue: 1.0)
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 0) {
                    // Header
                    HStack {
                        Text("Reminders")
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
                    
                    // House Map
                    ZStack {
                        // House background image placeholder
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.gray.opacity(0.2))
                            .frame(height: 500)
                            .overlay(
                                Text("House Map View")
                                    .font(.system(size: 18))
                                    .foregroundColor(.gray)
                            )
                        
                        // Interactive Pins
                        Button(action: { showPin1Alert.toggle() }) {
                            Image(systemName: "mappin.circle.fill")
                                .font(.system(size: 40))
                                .foregroundColor(showPin1Alert ? .red : .blue)
                        }
                        .offset(x: -80, y: -100)
                        
                        Button(action: { showPin2Alert.toggle() }) {
                            Image(systemName: "mappin.circle.fill")
                                .font(.system(size: 40))
                                .foregroundColor(showPin2Alert ? .red : .blue)
                        }
                        .offset(x: 60, y: -80)
                        
                        Button(action: { showPin3Alert.toggle() }) {
                            Image(systemName: "mappin.circle.fill")
                                .font(.system(size: 40))
                                .foregroundColor(showPin3Alert ? .red : .blue)
                        }
                        .offset(x: -60, y: 80)
                        
                        Button(action: { showPin4Alert.toggle() }) {
                            Image(systemName: "mappin.circle.fill")
                                .font(.system(size: 40))
                                .foregroundColor(showPin4Alert ? .red : .blue)
                        }
                        .offset(x: 80, y: 100)
                        
                        // Alert boxes
                        if showPin1Alert {
                            AlertBox(title: "Bedroom", message: "Take medication before bed")
                                .offset(x: -80, y: -180)
                        }
                        
                        if showPin2Alert {
                            AlertBox(title: "Kitchen", message: "Turn off stove after cooking")
                                .offset(x: 60, y: -160)
                        }
                        
                        if showPin3Alert {
                            AlertBox(title: "Living Room", message: "Phone charger location")
                                .offset(x: -60, y: 0)
                        }
                        
                        if showPin4Alert {
                            AlertBox(title: "Bathroom", message: "Medicine cabinet")
                                .offset(x: 80, y: 20)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 32)
                    
                    // Bottom navigation
                    BottomNavView(currentScreen: .reminders, onNavigate: onNavigate)
                }
            }
            
            // Add button (fixed position)
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Button(action: { isAddHintOpen = true }) {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 56))
                            .foregroundColor(.blue)
                            .background(Color.white.clipShape(Circle()))
                            .shadow(radius: 4)
                    }
                    .padding(.trailing, 24)
                    .padding(.bottom, 100)
                }
            }
        }
        .sheet(isPresented: $isSettingsOpen) {
            SettingsView()
        }
        .sheet(isPresented: $isAddHintOpen) {
            AddHintView()
        }
    }
}

struct AlertBox: View {
    let title: String
    let message: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
            Text(message)
                .font(.system(size: 12))
                .foregroundColor(.white)
        }
        .padding(12)
        .background(Color.red)
        .cornerRadius(8)
        .shadow(radius: 4)
    }
}