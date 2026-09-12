package com.liferpg.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "app_users")
public class AppUser {
    
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    private String password;
    private int level = 1;
    private int currentXp = 0;
    private int gold = 0;
    private int streak = 0;
    private String title = "Novice Adventurer"; // Default title

    public AppUser() {}

    public AppUser(String username, String password) {
        this.username = username;
        this.password = password;
        this.level = 1;
        this.currentXp = 0;
        this.gold = 0;
        this.streak = 0;
        this.title = "Novice Adventurer";
    }

    // using getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public int getLevel() { return level; }
        public void setLevel(int level) { this.level = level; }

        public int getCurrentXp() { return currentXp; }
        public void setCurrentXp(int currentXp) { this.currentXp = currentXp; }

        public int getGold() { return gold; }
        public void setGold(int gold) { this.gold = gold; }

        public int getStreak() { return streak; }
        public void setStreak(int streak) { this.streak = streak; }

        public String getTitle() { return title;}
        public void setTitle(String title) { this.title = title; }

}