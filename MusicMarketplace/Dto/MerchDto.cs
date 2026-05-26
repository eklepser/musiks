namespace MusicMarketplace.DTOs;

public class MerchDto
{
    public int merch_id { get; set; }
    public int product_id { get; set; }
    public string name { get; set; } = null!;
    public decimal price { get; set; }
    public string? description { get; set; }
    public int stock { get; set; }
    public int manufacturer_id { get; set; }
    public string type { get; set; } = null!;
    public string? material { get; set; }
    public string? color { get; set; }

    public string? size { get; set; }
    public string? gender { get; set; }

    public string? accessory_type { get; set; }
    public decimal? weight { get; set; }

    public List<int>? artistIds { get; set; }
    public List<int>? genreIds { get; set; }
}
 
public class CreateUpdateMerchDto
{
    public string name { get; set; } = null!;
    public decimal price { get; set; }
    public string? description { get; set; }
    public int stock { get; set; }
    public int manufacturer_id { get; set; }
    public string type { get; set; } = null!;
    public string? material { get; set; }
    public string? color { get; set; }

    public string? size { get; set; }
    public string? gender { get; set; }

    public string? accessory_type { get; set; }
    public decimal? weight { get; set; }

    public List<int>? artistIds { get; set; }
    public List<int>? genreIds { get; set; }
}