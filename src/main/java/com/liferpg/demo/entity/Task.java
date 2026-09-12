package com.liferpg.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tasks")
public class Task {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn (name = "user_id")
    private AppUser user;

    private String title;
    private String attributesType; // (e.g., "physical", "mental", "social", "intellect")
    private int xpReward = 20;
    private int goldReward = 10;
    private boolean completed = false;

    public Task() {}
    
    // using getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAttributesType() { return attributesType; }
    public void setAttributesType(String attributesType) { this.attributesType = attributesType; }

    public int getXpReward() { return xpReward; }
    public void setXpReward(int xpReward) { this.xpReward = xpReward; }

    public int getGoldReward() { return goldReward; }
    public void setGoldReward(int goldReward) { this.goldReward = goldReward; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

}
