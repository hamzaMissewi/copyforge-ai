package com.copyforge.repository;

import com.copyforge.entity.Template;
import com.copyforge.entity.Generation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TemplateRepository extends JpaRepository<Template, Long> {
    List<Template> findByContentType(Generation.ContentType contentType);
    List<Template> findByIsPremiumFalse();
    List<Template> findByCategory(String category);
}
