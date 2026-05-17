namespace MusicMarketplace.DTOs;

public class ProductGenreDto
{
    public int product_id { get; set; }
    public int genre_id { get; set; }
    public string product_name { get; set; } = null!;
    public string genre_name { get; set; } = null!;
}