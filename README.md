Life RPG Arcade 🎮

Life RPG Arcade is a web application that transforms daily task management and habit tracking into a gamified retro arcade experience. Built with Spring Boot and containerized using Docker, the platform offers dynamic progression and real-time backend processing.

───

🚀 Live Demo

• Web Service URL:https://life-rpg-arcade.onrender.com
• Deployment Platform: Render

───

🛠️ Tech Stack

• Backend: Java 17, Spring Boot (Spring Web, Spring Data JPA)
• Database: H2 In-Memory Database (Production/Cloud), PostgreSQL (Local)
• Frontend: HTML5, CSS3, JavaScript (Served via Spring Boot Static Resources)
• Build Tool: Maven
• Containerization: Docker (Multi-stage build)

───

📁 Project Structure

text
demo/
├── src/
│   ├── main/
│   │   ├── java/            # Spring Boot backend logic (Controllers, Models, Services)
│   │   └── resources/
│   │       ├── static/      # Frontend files (index.html, CSS, JS)
│   │       └── application.properties # App configuration & DB profiles
├── Dockerfile               # Multi-stage Docker build configuration
└── pom.xml                  # Maven dependencies

 Running Locally
​Prerequisites
• ​Java 17 JDK
• ​Maven 3.8+
• ​Docker Desktop (optional, for containerized local execution)
​Option 1: Run via Maven
git clone https://github.com/glamknight/life-rpg-arcade.git
cd life-rpg-arcade/demo
mvn spring-boot:run

Access the application at http://localhost:8080.
​Option 2: Run via Docker
docker build -t liferpg-arcade .
docker run -p 8080:8080 liferpg-arcade

☁️ Deployment Pipeline
​The application is configured for automatic deployment on Render using Docker:
1. ​Docker multi-stage builds compile the application into a lightweight runnable JAR.
2. ​Dynamic port binding handles ${PORT:8080} assigned by cloud providers.
3. ​Embedded H2 database ensures isolated, zero-dependency cloud hosting.

───

Step 2: Push the README.md to GitHub

In your VS Code terminal (PS ...\LifeRpgArcade\demo>), run:

bash
git add README.md
git commit -m "Add project documentation and setup details in README"
git push origin main
