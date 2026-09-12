package com.liferpg.demo.controller;

import com.liferpg.demo.entity.AppUser;
import com.liferpg.demo.entity.Task;
import com.liferpg.demo.repository.TaskRepository;
import com.liferpg.demo.repository.UserRepository;
import com.liferpg.demo.service.RpgService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController 
@RequestMapping ("/api")
@CrossOrigin(origins = "*")
public class ApiController {

    private final RpgService rpgService;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

        public ApiController(UserRepository userRepository, TaskRepository taskRepository, RpgService rpgService) {
            this.userRepository = userRepository;
            this.taskRepository = taskRepository;
            this.rpgService = rpgService;
        }

        // Default endpoint to initialize a user for testing purposes
        @PostMapping("/user/init")
        public AppUser initUser() {
            return userRepository.findByUsername("Player1").orElseGet(() -> {
                AppUser User = new AppUser();
                User.setUsername("Player1");
                User.setPassword("password");
                return userRepository.save(User);
            });
        }
        

        // Fetch user details
        @GetMapping("/users/{userId}")
        public AppUser getUser(@PathVariable Long id) {
            return userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        // Fetch tasks for a user
        @GetMapping("/users/{userId}/tasks")
        public List<Task> getUserTasks(@PathVariable Long id) {
            return taskRepository.findByUserIdAndCompletedFalse(id);
        }

        
        // 1. LOGIN / USER SWITCHER
        @PostMapping("/user/login")
        public AppUser login(@RequestParam String username) {
            return userRepository.findByUsername(username)
                .orElseGet(() -> {
                    AppUser newUser = new AppUser(username, "defaultPass");
                    return userRepository.save(newUser);
                });
        }

        // 2. BUY REAL-LIFE REWARD (Deducts gold)
        @PostMapping("/user/{id}/buy-reward")
        public ResponseEntity<?> buyReward(@PathVariable Long id, @RequestParam int cost) {
            AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
            if (user.getGold() < cost) {
                return ResponseEntity.badRequest().body("Not enough gold!");
            }
            user.setGold(user.getGold() - cost);
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }

        // 3. BUY & EQUIP TITLE (Deducts gold + changes title)
        @PostMapping("/user/{id}/buy-title")
        public ResponseEntity<?> buyTitle(@PathVariable Long id, @RequestParam String title, @RequestParam int cost) {
            AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
            if (user.getGold() < cost) {
                return ResponseEntity.badRequest().body("Not enough gold!");
            }
            user.setGold(user.getGold() - cost);
            user.setTitle(title);
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }

        // Create a new task for a user
        @PostMapping("/users/{userId}/tasks")
        public Task createTask(@PathVariable Long id, @RequestBody Task task) {
            AppUser user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            task.setUser(user);
            return taskRepository.save(task);
        }

        // Complete a task for a user
        @PostMapping("/users/{userId}/tasks/{taskId}/complete")
        public AppUser completeTask(@PathVariable Long userId, @PathVariable Long taskId) {
            return rpgService.completeTask(userId, taskId);
        }
    
}
