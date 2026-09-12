package com.liferpg.demo.service;

import com.liferpg.demo.entity.AppUser;
import com.liferpg.demo.entity.Task;
import com.liferpg.demo.repository.TaskRepository;
import com.liferpg.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RpgService {
    
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public RpgService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    // Required XP = 100 * (Level ^ 1.5)
    public int getRequiredXp(int level) {
        return (int) (100 * Math.pow(level, 1.5));
    }

    @Transactional
    public AppUser completeTask(Long userId, Long taskId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (task.isCompleted()) {
            return user; // Task already completed, no action needed
        }

        // Mark the task as completed
        task.setCompleted(true);
        taskRepository.save(task);

        // Add rewards
        user.setGold(user.getGold() + task.getGoldReward());
        int newXp = user.getCurrentXp() + task.getXpReward();
        int xpNeeded = getRequiredXp(user.getLevel());

        // Check for level up
        if (newXp >= xpNeeded) {
            user.setLevel(user.getLevel() + 1);
            user.setCurrentXp(newXp - xpNeeded); // Carry over excess XP
        } else {
            user.setCurrentXp(newXp);
        }

        return userRepository.save(user);
    }
}
