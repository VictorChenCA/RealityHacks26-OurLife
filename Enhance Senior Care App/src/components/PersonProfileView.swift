import SwiftUI

struct PersonProfileView: View {
    let person: PersonProfile
    let onBack: () -> Void
    
    var body: some View {
        ZStack {
            Color(red: 0.97, green: 0.98, blue: 1.0)
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 0) {
                    // Header with background
                    ZStack(alignment: .topLeading) {
                        if let backgroundURL = person.backgroundImageURL {
                            AsyncImage(url: URL(string: backgroundURL)) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .opacity(0.5)
                            } placeholder: {
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        Color.blue.opacity(0.6),
                                        Color.blue.opacity(0.3)
                                    ]),
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            }
                            .frame(height: 200)
                            .clipped()
                        } else {
                            LinearGradient(
                                gradient: Gradient(colors: [
                                    Color.blue.opacity(0.6),
                                    Color.blue.opacity(0.3)
                                ]),
                                startPoint: .top,
                                endPoint: .bottom
                            )
                            .frame(height: 200)
                        }
                        
                        // Back button
                        Button(action: onBack) {
                            HStack(spacing: 8) {
                                Image(systemName: "chevron.left")
                                    .font(.system(size: 16, weight: .semibold))
                                Text("Back")
                                    .font(.system(size: 14, weight: .semibold))
                            }
                            .foregroundColor(.black)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(Color.white.opacity(0.95))
                            .cornerRadius(20)
                            .shadow(color: Color.black.opacity(0.15), radius: 4, x: 0, y: 2)
                        }
                        .padding(.leading, 16)
                        .padding(.top, 32)
                    }
                    
                    // Profile image
                    VStack {
                        if let imageURL = person.profileImageURL {
                            AsyncImage(url: URL(string: imageURL)) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Color.gray.opacity(0.3)
                            }
                            .frame(width: 120, height: 120)
                            .clipShape(Circle())
                            .overlay(Circle().stroke(Color.white, lineWidth: 4))
                            .shadow(radius: 8)
                        } else {
                            Image(systemName: person.systemImage)
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: 120, height: 120)
                                .foregroundColor(.blue)
                                .background(Color.white)
                                .clipShape(Circle())
                                .overlay(Circle().stroke(Color.white, lineWidth: 4))
                                .shadow(radius: 8)
                        }
                    }
                    .offset(y: -60)
                    .padding(.bottom, -60)
                    
                    // Profile info
                    VStack(spacing: 24) {
                        VStack(spacing: 4) {
                            Text(person.name)
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(.black)
                            Text(person.relation)
                                .font(.system(size: 14))
                                .foregroundColor(.gray)
                        }
                        .padding(.top, 70)
                        
                        // Age
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Age")
                                .font(.system(size: 10))
                                .foregroundColor(.gray)
                            Text(person.age)
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.black)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(16)
                        .background(Color.white)
                        .cornerRadius(8)
                        .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
                        .padding(.horizontal, 24)
                        
                        // Interests
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Interests")
                                .font(.system(size: 10))
                                .foregroundColor(.gray)
                            
                            FlowLayout(spacing: 8) {
                                ForEach(person.interests, id: \.self) { interest in
                                    Text(interest)
                                        .font(.system(size: 12))
                                        .foregroundColor(.blue)
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 6)
                                        .background(Color.blue.opacity(0.1))
                                        .cornerRadius(16)
                                }
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(16)
                        .background(Color.white)
                        .cornerRadius(8)
                        .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
                        .padding(.horizontal, 24)
                        
                        // Things to Remember
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Things to Remember")
                                .font(.system(size: 10))
                                .foregroundColor(.gray)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                ForEach(person.facts, id: \.self) { fact in
                                    HStack(alignment: .top, spacing: 8) {
                                        Text("•")
                                            .font(.system(size: 14))
                                            .foregroundColor(.blue)
                                        Text(fact)
                                            .font(.system(size: 14))
                                            .foregroundColor(.black)
                                    }
                                }
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(16)
                        .background(Color.white)
                        .cornerRadius(8)
                        .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
                        .padding(.horizontal, 24)
                        
                        // Recent Memories Together
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Recent Memories Together")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.black)
                                .padding(.horizontal, 24)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 8) {
                                    ForEach(person.memories) { memory in
                                        VStack(spacing: 2) {
                                            AsyncImage(url: URL(string: memory.imageURL)) { image in
                                                image
                                                    .resizable()
                                                    .aspectRatio(contentMode: .fill)
                                            } placeholder: {
                                                Color.gray.opacity(0.3)
                                            }
                                            .frame(width: 86, height: 130)
                                            .clipShape(RoundedRectangle(cornerRadius: 4))
                                            
                                            Text(memory.title)
                                                .font(.system(size: 10))
                                                .foregroundColor(.black)
                                                .frame(width: 86)
                                                .multilineTextAlignment(.center)
                                        }
                                    }
                                }
                                .padding(.horizontal, 24)
                            }
                        }
                        .padding(.bottom, 80)
                    }
                }
            }
        }
    }
}

// Helper view for wrapping interests tags
struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(
            in: proposal.replacingUnspecifiedDimensions().width,
            subviews: subviews,
            spacing: spacing
        )
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(
            in: bounds.width,
            subviews: subviews,
            spacing: spacing
        )
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.frames[index].minX, y: bounds.minY + result.frames[index].minY), proposal: .unspecified)
        }
    }
    
    struct FlowResult {
        var frames: [CGRect] = []
        var size: CGSize = .zero
        
        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var x: CGFloat = 0
            var y: CGFloat = 0
            var lineHeight: CGFloat = 0
            
            for subview in subviews {
                let size = subview.sizeThatFits(.unspecified)
                
                if x + size.width > maxWidth && x > 0 {
                    x = 0
                    y += lineHeight + spacing
                    lineHeight = 0
                }
                
                frames.append(CGRect(x: x, y: y, width: size.width, height: size.height))
                lineHeight = max(lineHeight, size.height)
                x += size.width + spacing
            }
            
            self.size = CGSize(width: maxWidth, height: y + lineHeight)
        }
    }
}
