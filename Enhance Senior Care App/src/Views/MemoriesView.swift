import SwiftUI

struct MemoriesView: View {
    let onNavigate: (ContentView.Screen) -> Void
    
    @State private var isSettingsOpen = false
    @State private var selectedPerson: PersonProfile?
    @State private var showPersonProfile = false
    
    var body: some View {
        ZStack {
            Color(red: 0.97, green: 0.98, blue: 1.0)
                .ignoresSafeArea()
            
            if let person = selectedPerson, showPersonProfile {
                PersonProfileView(person: person, onBack: {
                    showPersonProfile = false
                    selectedPerson = nil
                })
            } else {
                ZStack {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 0) {
                            // Header
                            HStack {
                                Text("Memories")
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
                            
                            // Recent Memories
                            VStack(alignment: .leading, spacing: 16) {
                                Text("Recent Memories")
                                    .font(.system(size: 16, weight: .bold))
                                    .foregroundColor(.black)
                                    .padding(.horizontal, 16)
                                
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 8) {
                                        MemoryCard(
                                            imageURL: "https://images.unsplash.com/photo-1519741497674-611481863552",
                                            title: "Grandson Sam's Wedding",
                                            onTap: {
                                                selectedPerson = PersonProfile.wedding
                                                showPersonProfile = true
                                            }
                                        )
                                        MemoryCard(
                                            imageURL: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d",
                                            title: "Great grandson Eddie's birthday",
                                            onTap: {}
                                        )
                                        MemoryCard(
                                            imageURL: "https://images.unsplash.com/photo-1559827260-dc66d52bef19",
                                            title: "Family vacation in Hawaii",
                                            onTap: {}
                                        )
                                        MemoryCard(
                                            imageURL: "https://images.unsplash.com/photo-1511895426328-dc8714191300",
                                            title: "Daughter Mary's Visit",
                                            onTap: {}
                                        )
                                    }
                                    .padding(.horizontal, 16)
                                }
                            }
                            .padding(.bottom, 32)
                            
                            // Bottom navigation
                            BottomNavView(currentScreen: .memories, onNavigate: onNavigate)
                        }
                    }
                    .ignoresSafeArea(edges: .bottom)
                }
            }
        }
        .sheet(isPresented: $isSettingsOpen) {
            SettingsView()
        }
    }
}

struct MemoryCard: View {
    let imageURL: String
    let title: String
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
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
        .buttonStyle(PlainButtonStyle())
    }
}

struct PersonCard: View {
    let name: String
    let relation: String
    let imageURL: String?
    let systemImage: String
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                if let url = imageURL {
                    AsyncImage(url: URL(string: url)) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Color.gray.opacity(0.3)
                    }
                    .frame(width: 50, height: 50)
                    .clipShape(Circle())
                } else {
                    Image(systemName: systemImage)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 50, height: 50)
                        .foregroundColor(.blue)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(name)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.black)
                    Text(relation)
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 14))
                    .foregroundColor(.gray)
            }
            .padding(12)
            .background(Color.white)
            .cornerRadius(8)
            .shadow(color: Color.black.opacity(0.08), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(PlainButtonStyle())
    }
}