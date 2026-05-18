namespace MusicMarketplace.Models
{
    public class TicketCreateDto
    {
        public int product_id { get; set; }
        public int concert_id { get; set; }
        public string seat_row { get; set; }
        public string seat_number { get; set; }
        public string price_category { get; set; }
    }

    public class TicketUpdateDto : TicketCreateDto
    {
        public int ticket_id { get; set; }
    }
}