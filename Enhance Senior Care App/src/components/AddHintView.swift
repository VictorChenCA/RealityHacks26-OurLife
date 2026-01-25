import SwiftUI

struct AddHintView: View {
    @Environment(\.dismiss) var dismiss
    
    @State private var title = ""
    @State private var location = ""
    @State private var description = ""
    @State private var selectedRoom = "Bedroom"
    @State private var isImportant = false
    
    let rooms = ["Bedroom", "Kitchen", "Living Room", "Bathroom", "Garage", "Other"]
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Hint Details")) {
                    TextField("Title", text: $title)
                    
                    Picker("Room", selection: $selectedRoom) {
                        ForEach(rooms, id: \.self) { room in
                            Text(room).tag(room)
                        }
                    }
                    
                    TextField("Specific Location", text: $location)
                }
                
                Section(header: Text("Description")) {
                    TextEditor(text: $description)
                        .frame(height: 100)
                }
                
                Section {
                    Toggle("Mark as Important", isOn: $isImportant)
                }
                
                Section {
                    Button(action: {
                        // Save hint logic
                        dismiss()
                    }) {
                        Text("Add Hint")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.white)
                    }
                    .listRowBackground(Color.blue)
                }
            }
            .navigationTitle("Add Hint")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
}
