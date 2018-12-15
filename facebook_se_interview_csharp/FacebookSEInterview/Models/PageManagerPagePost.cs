namespace FbPageManager.Models
{
    public class PageManagerPagePost
    {
        public string Id { get; set; }

        public string Message { get; set; }

        public string DatePosted { get; set; }

        public bool IsPublished { get; set; }

        public int NumberOfComments { get; set; }

        public int NumberOfReactions { get; set; }
    }
}
