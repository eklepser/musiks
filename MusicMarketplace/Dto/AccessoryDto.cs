namespace MusicMarketplace.DTOs;

public class AccessoryDto
{
    public int accessory_id { get; set; }
    public int merch_id { get; set; }
    public int product_id { get; set; }
    public string name { get; set; }
    public decimal price { get; set; }
    public string? description { get; set; }
    public int stock { get; set; }
    public int manufacturer_id { get; set; }
    public string? material { get; set; }
    public string? color { get; set; }
    public string? accessory_type { get; set; }
    public decimal? weight { get; set; }
}

public class AccessoryResponseDto
{
    public int accessory_id { get; set; }
    public int product_id { get; set; }
    public string name { get; set; }
    public decimal price { get; set; }
    public string? description { get; set; }
    public int stock { get; set; }
    public int manufacturer_id { get; set; }
    public string? material { get; set; }
    public string? color { get; set; }
    public string? accessory_type { get; set; }
    public decimal? weight { get; set; }
    public List<int>? artistIds { get; set; }
    public string? artistNames { get; set; }
}

public class AccessoryCreateUpdateDto
{
    public int accessory_id { get; set; }
    public string name { get; set; }
    public decimal price { get; set; }
    public string? description { get; set; }
    public int stock { get; set; }
    public int manufacturer_id { get; set; }
    public string? material { get; set; }
    public string? color { get; set; }
    public string? accessory_type { get; set; }
    public decimal? weight { get; set; }
    public List<int>? artistIds { get; set; } = new List<int>();
    public List<int>? genreIds { get; set; } = new List<int>();
}