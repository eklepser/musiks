namespace MusicMarketplace.DTOs;

public class CartDto
{
    public int product_id { get; set; }
    public string name { get; set; }
    public decimal price { get; set; }
    public int quantity { get; set; }
    public DateTime added_date { get; set; }
}

public class CartCreateDto
{
    public int user_id { get; set; }
    public int product_id { get; set; }
    public int quantity { get; set; }
}

public class CartFilterDto
{
    public int product_id { get; set; }
    public string name { get; set; }
    public decimal price { get; set; }
    public int quantity { get; set; }
    public DateTime added_date { get; set; }
}