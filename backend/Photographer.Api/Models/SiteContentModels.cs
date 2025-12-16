using System.Collections.Generic;

namespace Photographer.Api.Models;

public record SiteContent(
    HeroSection Hero,
    AboutSection About,
    List<StatItem> Stats,
    List<SkillItem> Skills,
    ResumeSection Resume,
    PortfolioSection Portfolio,
    List<ServiceItem> Services,
    ContactSection Contact);

public record HeroSection(
    string Name,
    string Headline,
    string[] Roles,
    string BackgroundImage,
    List<SocialLink> SocialLinks);

public record SocialLink(string Label, string Url, string Icon);

public record AboutSection(
    string Title,
    string Intro,
    List<string> Description,
    string Highlight,
    string ProfileImage,
    List<InfoItem> Details,
    string Closing);

public record InfoItem(string Label, string Value);

public record StatItem(string Label, int Value, string Icon, string? Suffix = null);

public record SkillItem(string Name, int Value);

public record ResumeSection(
    string Intro,
    ResumeSummary Summary,
    List<PricingItem> Pricing,
    List<ProcessItem> Process);

public record ResumeSummary(
    string Name,
    string Role,
    string Description,
    List<string> Details);

public record PricingItem(
    string Title,
    string Duration,
    string Description,
    string Details,
    string Price);

public record ProcessItem(
    string Title,
    string Duration,
    string Location,
    List<string> Bullets);

public record PortfolioSection(
    string Intro,
    List<PortfolioFilter> Filters,
    List<PortfolioItem> Items);

public record PortfolioFilter(string Label, string Value);

public record PortfolioItem(
    string Title,
    string Description,
    string Image,
    string Category,
    string Badge);

public record ServiceItem(
    string Title,
    string Description,
    string Icon,
    string Accent);

public record ContactSection(
    string Intro,
    List<ContactItem> Items);

public record ContactItem(
    string Label,
    string Value,
    string Icon,
    string Type);

public record ContactRequest(
    string Name,
    string Email,
    string Phone,
    DateTime? ShootDate,
    string Subject,
    string Message);

public record ContactEntry(
    string Name,
    string Email,
    string Phone,
    DateTime? ShootDate,
    string Subject,
    string Message,
    DateTime SubmittedAt);

public record AvailabilityEntry(
    int Id,
    DateTime Date,
    string Note,
    string Status);

public record AvailabilityRequest(
    DateTime Date,
    string? Note,
    string Status = AvailabilityStatuses.Available);
