namespace MusicMarketplace.DTOs;

public class ReviewDto
{
    public int product_id { get; set; }
    public string product_name { get; set; }
    public int rating { get; set; }
    public string? review_text { get; set; }
    public DateTime review_date { get; set; }
}

public class ReviewWithUserDto
{
    public int product_id { get; set; }
    public string product_name { get; set; }
    public int rating { get; set; }
    public string? review_text { get; set; }
    public DateTime review_date { get; set; }
    public string user_name { get; set; }
}

public class ReviewCreateDto
{
    public int user_id { get; set; }
    public int product_id { get; set; }
    public int rating { get; set; }
    public string? review_text { get; set; }
}