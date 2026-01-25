import SwiftUI

struct Task: Identifiable {
    let id: String
    let title: String
    let location: String
    let time: String
    let endTime: String
    let frequency: String
    let description: String
    let category: TaskCategory
    let backgroundColor: Color
    let frequencyColor: Color
}

enum TaskCategory {
    case social, personal, medical, errands
}
