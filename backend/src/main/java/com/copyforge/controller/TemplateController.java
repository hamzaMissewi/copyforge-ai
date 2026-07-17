package com.copyforge.controller;

import com.copyforge.entity.Generation;
import com.copyforge.entity.Template;
import com.copyforge.service.TemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    private final TemplateService templateService;

    public TemplateController(TemplateService templateService) {
        this.templateService = templateService;
    }

    @GetMapping
    public ResponseEntity<List<Template>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Template> getTemplateById(@PathVariable Long id) {
        return ResponseEntity.ok(templateService.getTemplateById(id));
    }

    @GetMapping("/type/{contentType}")
    public ResponseEntity<List<Template>> getTemplatesByType(@PathVariable Generation.ContentType contentType) {
        return ResponseEntity.ok(templateService.getTemplatesByType(contentType));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Template>> getTemplatesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(templateService.getTemplatesByCategory(category));
    }
}
