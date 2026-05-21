namespace MusicMarketplace.DTOs;

public class ConcertDto
{
    public int concert_id { get; set; }
    public string title { get; set; }
    public string venue { get; set; }
    public DateTime datetime { get; set; }
    public List<int> artistIds { get; set; }
}

public class ConcertFilterResult
{
    public int concert_id { get; set; }
    public string title { get; set; }
    public string venue { get; set; }
    public DateTime datetime { get; set; }
    public string artistNames { get; set; }
    public List<int> artistIds { get; set; }

}