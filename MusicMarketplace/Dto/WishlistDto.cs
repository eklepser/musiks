namespace MusicMarketplace.DTOs;

public class WishlistDto
{
    public int product_id { get; set; }
    public string name { get; set; }
    public decimal price { get; set; }
    public DateTime added_date { get; set; }
}

public class WishlistCreateDto
{
    public int user_id { get; set; }
    public int product_id { get; set; }
}
