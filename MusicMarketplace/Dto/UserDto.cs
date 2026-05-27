namespace MusicMarketplace.DTOs;
public class UserDto
{
    public int user_id { get; set; }
    public string login { get; set; }
    public string email { get; set; }
    public string full_name { get; set; }
    public DateTime? registration_date { get; set; }
    public string? password { get; set; }
}

public class UserListDto
{
    public int user_id { get; set; }
    public string login { get; set; }
    public string email { get; set; }
    public DateTime registration_date { get; set; }
    public string full_name { get; set; }
}