using System;

namespace MusicMarketplace.Models
{
    public class ConcertDto
    {
        public int concert_id { get; set; }  
        public string title { get; set; }
        public string venue { get; set; }
        public DateTime datetime { get; set; }
    }
}