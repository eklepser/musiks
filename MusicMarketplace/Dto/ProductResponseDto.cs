namespace MusicMarketplace.DTOs;

public class ProductResponseDto
{
    public int product_id { get; set; }
    public string name { get; set; } = null!;
    public decimal price { get; set; }
    public string? description { get; set; }
    public int stock { get; set; }
    public int manufacturer_id { get; set; }
    public string type { get; set; } = null!;
    public string typeName { get; set; } = null!;
    public string? artistNames { get; set; }
    public string? artistIds { get; set; }

    public int? concert_id { get; set; }
    public string? concert_title { get; set; }
    public string? price_category { get; set; }
    public int? quantity { get; set; }

    public string? material { get; set; }
    public string? color { get; set; }
    public string? size { get; set; }
    public string? gender { get; set; }

    public string? accessory_type { get; set; }
    public decimal? weight { get; set; }
}