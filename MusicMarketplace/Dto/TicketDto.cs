namespace MusicMarketplace.Models
{
    public class TicketDto
    {
        public int ticket_id { get; set; }
        public string name { get; set; }
        public decimal price { get; set; }
        public string description { get; set; }
        public int stock { get; set; }
        public int manufacturer_id { get; set; }
        public int concert_id { get; set; }
        public string seat_row { get; set; }
        public string seat_number { get; set; }
        public string price_category { get; set; }
    }
}