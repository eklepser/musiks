namespace MusicMarketplace.DTOs;

public class ArtistMerchDto
{
    public int artist_id { get; set; }
    public int merch_id { get; set; }
    public string artist_name { get; set; } = null!;
    public string product_name { get; set; } = null!;
}