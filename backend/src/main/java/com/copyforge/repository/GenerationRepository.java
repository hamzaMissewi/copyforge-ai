package com.copyforge.repository;

import com.copyforge.entity.Generation;
import com.copyforge.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GenerationRepository extends JpaRepository<Generation, Long> {

    Page<Generation> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    Page<Generation> findByUserAndContentTypeOrderByCreatedAtDesc(User user, Generation.ContentType contentType, Pageable pageable);

    Page<Generation> findByUserAndBookmarkedOrderByCreatedAtDesc(User user, Boolean bookmarked, Pageable pageable);

    List<Generation> findTop5ByUserOrderByCreatedAtDesc(User user);

    long countByUser(User user);

    @Query("SELECT AVG(g.score) FROM Generation g WHERE g.user = :user AND g.score IS NOT NULL")
    Double getAverageScoreByUser(@Param("user") User user);
}
