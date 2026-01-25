import SwiftUI

struct PersonProfile {
    let id: String
    let name: String
    let relation: String
    let age: String
    let interests: [String]
    let facts: [String]
    let profileImageURL: String?
    let systemImage: String
    let backgroundImageURL: String?
    let memories: [Memory]
    
    struct Memory: Identifiable {
        let id: String
        let imageURL: String
        let title: String
    }
    
    static let john = PersonProfile(
        id: "john",
        name: "John Smith",
        relation: "Me",
        age: "78 years old",
        interests: ["Gardening", "Reading", "Church", "Coffee"],
        facts: [
            "Retired engineer who worked at Boeing for 35 years",
            "Loves spending time in the garden every morning",
            "Married to Jill for 52 years",
            "Has two children: Mary and Ricky"
        ],
        profileImageURL: nil,
        systemImage: "person.circle.fill",
        backgroundImageURL: nil,
        memories: [
            Memory(id: "1", imageURL: "https://images.unsplash.com/photo-1519741497674-611481863552", title: "Grandson Sam's Wedding"),
            Memory(id: "2", imageURL: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d", title: "Great grandson Eddie's birthday"),
            Memory(id: "3", imageURL: "https://images.unsplash.com/photo-1559827260-dc66d52bef19", title: "Family vacation in Hawaii"),
            Memory(id: "4", imageURL: "https://images.unsplash.com/photo-1511895426328-dc8714191300", title: "Daughter Mary's Visit")
        ]
    )
    
    static let joe = PersonProfile(
        id: "joe",
        name: "Joe Wilson",
        relation: "Neighbor & Best Friend",
        age: "76 years old",
        interests: ["Golf", "Fishing", "Coffee", "Woodworking"],
        facts: [
            "Lived next door for 25 years",
            "You both play golf together every Thursday",
            "He helped you build your garden shed",
            "His wife Betty makes amazing apple pie",
            "You served in the Navy together in the 1960s"
        ],
        profileImageURL: nil,
        systemImage: "person.circle.fill",
        backgroundImageURL: nil,
        memories: [
            Memory(id: "1", imageURL: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b", title: "Golf outing last month"),
            Memory(id: "2", imageURL: "https://images.unsplash.com/photo-1559827260-dc66d52bef19", title: "Coffee at the diner"),
            Memory(id: "3", imageURL: "https://images.unsplash.com/photo-1544551763-46a013bb70d5", title: "Fishing trip"),
            Memory(id: "4", imageURL: "https://images.unsplash.com/photo-1511895426328-dc8714191300", title: "Building the shed")
        ]
    )
    
    static let wedding = PersonProfile(
        id: "wedding",
        name: "Sam's Wedding",
        relation: "Special Memory",
        age: "June 2023",
        interests: ["Family", "Celebration", "Love"],
        facts: [
            "Your grandson Sam married Sarah",
            "The ceremony was at St. Mary's Church",
            "You gave a touching speech at the reception",
            "The whole family was there to celebrate",
            "It was a beautiful summer day"
        ],
        profileImageURL: "https://images.unsplash.com/photo-1519741497674-611481863552",
        systemImage: "heart.circle.fill",
        backgroundImageURL: "https://images.unsplash.com/photo-1519741497674-611481863552",
        memories: [
            Memory(id: "1", imageURL: "https://images.unsplash.com/photo-1519741497674-611481863552", title: "The ceremony"),
            Memory(id: "2", imageURL: "https://images.unsplash.com/photo-1559827260-dc66d52bef19", title: "Family photo"),
            Memory(id: "3", imageURL: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d", title: "Your speech"),
            Memory(id: "4", imageURL: "https://images.unsplash.com/photo-1511895426328-dc8714191300", title: "The reception")
        ]
    )
}
