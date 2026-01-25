import SwiftUI

struct SettingsView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                // Profile Image
                Image(systemName: "person.circle.fill")
                    .resizable()
                    .frame(width: 100, height: 100)
                    .foregroundColor(.blue)
                    .padding(.top, 32)
                
                // User Info
                VStack(spacing: 8) {
                    Text("John Smith")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.black)
                    
                    Text("john.smith@email.com")
                        .font(.system(size: 14))
                        .foregroundColor(.gray)
                }
                
                // Settings Options
                VStack(spacing: 0) {
                    SettingsRow(icon: "person.fill", title: "Profile", value: "Edit")
                    Divider().padding(.leading, 56)
                    
                    SettingsRow(icon: "bell.fill", title: "Notifications", value: "On")
                    Divider().padding(.leading, 56)
                    
                    SettingsRow(icon: "lock.fill", title: "Privacy", value: "")
                    Divider().padding(.leading, 56)
                    
                    SettingsRow(icon: "questionmark.circle.fill", title: "Help & Support", value: "")
                }
                .background(Color.white)
                .cornerRadius(12)
                .padding(.horizontal, 16)
                
                Spacer()
                
                Button(action: {
                    // Logout action
                }) {
                    Text("Log Out")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.red)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.white)
                        .cornerRadius(12)
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 32)
            }
            .background(Color(red: 0.97, green: 0.98, blue: 1.0))
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct SettingsRow: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(.blue)
                .frame(width: 24)
            
            Text(title)
                .font(.system(size: 16))
                .foregroundColor(.black)
            
            Spacer()
            
            if !value.isEmpty {
                Text(value)
                    .font(.system(size: 14))
                    .foregroundColor(.gray)
            }
            
            Image(systemName: "chevron.right")
                .font(.system(size: 14))
                .foregroundColor(.gray)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}
