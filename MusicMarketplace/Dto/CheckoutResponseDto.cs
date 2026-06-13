namespace MusicMarketplace.DTOs;

public class CheckoutResponseDto
{
    public int OrderId { get; set; }
    public decimal OriginalTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalTotal { get; set; }
    public string? DiscountMessage { get; set; }
}