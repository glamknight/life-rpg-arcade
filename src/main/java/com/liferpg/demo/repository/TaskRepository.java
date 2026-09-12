package com.liferpg.demo.repository;

import com.liferpg.demo.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdAndCompletedFalse(Long userId);
    
}
