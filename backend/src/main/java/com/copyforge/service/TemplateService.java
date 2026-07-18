package com.copyforge.service;

import com.copyforge.entity.Template;
import com.copyforge.entity.Generation;
import com.copyforge.repository.TemplateRepository;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.List;

@Service
public class TemplateService {

    private final TemplateRepository templateRepository;

    public TemplateService(TemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @PostConstruct
    public void init() {
        initializeDefaultTemplates();
    }

    public List<Template> getAllTemplates() {
        return templateRepository.findAll();
    }

    public List<Template> getTemplatesByType(Generation.ContentType contentType) {
        return templateRepository.findByContentType(contentType);
    }

    public List<Template> getFreeTemplates() {
        return templateRepository.findByIsPremiumFalse();
    }

    public List<Template> getTemplatesByCategory(String category) {
        return templateRepository.findByCategory(category);
    }

    public Template getTemplateById(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new com.copyforge.exception.ResourceNotFoundException("Template", "id", id));
    }

    public void initializeDefaultTemplates() {
        if (templateRepository.count() > 0) return;

        List<Template> defaults = List.of(
            createTemplate("Instagram Caption", Generation.ContentType.SOCIAL_MEDIA_POST, "Instagram",
                "Write an engaging Instagram caption for: {prompt}. Use relevant emojis, keep it under 2200 characters, include a call-to-action, and add 3-5 relevant hashtag suggestions at the end.",
                "Just dropped our spring collection! 🌸 Fresh styles, fresh vibes. Which look is your fave? Drop a 🙌 below! #SpringFashion #NewArrivals", false, "Social Media"),

            createTemplate("Tweet Post", Generation.ContentType.TWEET_THREAD, "Twitter/X",
                "Write a compelling tweet (max 280 chars) about: {prompt}. Make it punchy, shareable, and include a hook in the first line.",
                "Hot take: The best marketing doesn't feel like marketing. It feels like a friend recommending something they love.", false, "Social Media"),

            createTemplate("LinkedIn Post", Generation.ContentType.LINKEDIN_POST, "LinkedIn",
                "Write a professional LinkedIn post about: {prompt}. Start with a hook, provide value, use short paragraphs, and end with a question to drive engagement.",
                "I spent 3 years making the same marketing mistake.\n\nI was writing for myself, not my audience.\n\nHere's what changed everything...", false, "Professional"),

            createTemplate("Email Subject Lines", Generation.ContentType.EMAIL_CAMPAIGN, "Email",
                "Generate 10 email subject lines for: {prompt}. Include a mix of curiosity, urgency, and value-driven subject lines. Keep under 50 characters.",
                "1. Your exclusive invite inside 🎁\n2. Last chance: 48 hours left\n3. We made this just for you\n4. The secret to [benefit]\n5. Quick question...", false, "Email"),

            createTemplate("Google Ad Copy", Generation.ContentType.AD_COPY, "Google Ads",
                "Write 3 variations of Google Ad copy for: {prompt}. Include headlines (max 30 chars) and descriptions (max 90 chars). Focus on benefits and include a CTA.",
                "Headline: Save 50% on Premium Plans\nDesc: Join 10,000+ businesses boosting their marketing with AI. Start your free trial today. No credit card required.", false, "Paid Ads"),

            createTemplate("Facebook Ad", Generation.ContentType.AD_COPY, "Facebook",
                "Write a Facebook ad for: {prompt}. Structure: Hook headline, problem statement, solution, social proof, and clear CTA. Keep under 125 chars for primary text.",
                "Tired of spending hours writing marketing copy? ✍️\n\nOur AI writes high-converting copy in 30 seconds.\n\n⭐ Rated 4.9/5 by 5,000+ marketers\n\nTry free →", false, "Paid Ads"),

            createTemplate("Product Description", Generation.ContentType.PRODUCT_DESCRIPTION, "E-commerce",
                "Write a product description for: {prompt}. Include: a catchy headline, 3 key benefits as bullet points, emotional appeal, and a urgency-driven closing line.",
                "AirPod Pro Max — Immerse Yourself in Silence\n\n• Active Noise Cancellation blocks outside world\n• Spatial Audio creates surround-sound experience\n• 30-hour battery for all-day listening\n\nDon't just listen. Feel every note.", false, "E-commerce"),

            createTemplate("Blog Introduction", Generation.ContentType.BLOG_INTRO, "Blog",
                "Write an engaging blog introduction for: {prompt}. Use the PAS framework (Problem-Agitate-Solve). Hook the reader in the first sentence and tease the value ahead.",
                "Your marketing copy is costing you customers. Every day, businesses lose thousands in revenue because their words don't convert. But here's the good news: there's a framework that can fix that in minutes, not months.", false, "Content"),

            createTemplate("Landing Page Hero", Generation.ContentType.LANDING_PAGE, "Website",
                "Write landing page copy for: {prompt}. Include: a power headline, supporting subheadline, 3 feature bullets with icons, social proof snippet, and a CTA button text.",
                "Write Marketing Copy That Converts\nTrusted by 10,000+ businesses worldwide\n\n⚡ 10x faster than writing manually\n🎯 AI-trained on millions of converting copies\n📊 Average 47% higher click-through rates\n\n[Start Free Trial] — No credit card needed", false, "Website"),

            createTemplate("SMS Marketing", Generation.ContentType.SMS_MARKETING, "SMS",
                "Write an SMS marketing message for: {prompt}. Max 160 characters. Include an offer and a clear CTA with urgency. Use short, punchy language.",
                "🔥 FLASH SALE: 40% off everything for 24hrs! Use code SAVE40 at checkout. Shop now: [link] Reply STOP to opt out", false, "SMS")
        );

        templateRepository.saveAll(defaults);
    }

    private Template createTemplate(String name, Generation.ContentType type, String platform,
                                    String systemPrompt, String example, boolean premium, String category) {
        return Template.builder()
                .name(name)
                .contentType(type)
                .platform(platform)
                .systemPrompt(systemPrompt)
                .exampleOutput(example)
                .isPremium(premium)
                .category(category)
                .usageCount(0)
                .build();
    }
}
