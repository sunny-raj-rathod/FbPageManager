using System;
using System.Diagnostics;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using FacebookSEInterview.Models;
using FacebookSEInterview.Utilities;

namespace FacebookSEInterview.Controllers
{
    public class PageManagerController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Login()
        {
            return View();
        }

        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        /*
        public JsonResult GetAccessToken()
        {
            var accessToken = PageManagerUtilities.GetAccessToken();
            return Json(new { accessToken });
        }
        */

        public JsonResult CreatePost(
            string pageId,
            string accessToken,
            string postContent,
            bool isPublished)
        {
            PageManagerUtilities.CreatePost(pageId, accessToken, postContent, isPublished);
            return Json(new {});
        }

        public JsonResult UpdatePost(
            string postId,
            string pageId,
            string accessToken,
            string postContent,
            bool isPublished)
        {
            PageManagerUtilities.UpdatePost(postId, pageId, accessToken, postContent, isPublished);
            return Json(new { });
        }


        public JsonResult SaveSessionInfo(
            string userInfo,
            string sessionInfo)
        {
            PageManagerUtilities.SaveSessionInfo(userInfo, sessionInfo);
            return Json(new { });
        }

        public JsonResult ReadPublishedPost(string pageId, string accessToken, string nextPageUrl = "")
        {
            var posts = PageManagerUtilities.ReadPost(pageId, accessToken, nextPageUrl);
            return Json( new { posts.Data, posts.NextPageUrl });
        }

        public JsonResult ReadUnpublishedPost(string pageId, string accessToken, string nextPageUrl = "")
        {
            var posts = PageManagerUtilities.ReadUnpublishedPosts(pageId, accessToken, nextPageUrl);
            return Json(new { posts.Data, posts.NextPageUrl });
        }

        public JsonResult ReadPages(string userInfo)
        {
            var posts = PageManagerUtilities.GetPageList(userInfo);
            return Json(posts.Select(p => new { p.Id, p.Name, p.AccessToken, p.PictureUrl, p.NextPageUrl }));
        }

        public JsonResult ReadPageSummary(string pageId, string accessToken)
        {
            var posts = PageManagerUtilities.GetPageSummary(pageId, accessToken);
            return Json(posts.Select(p => new { p.Id, p.Name, p.Title, p.Period, p.Description, p.Values }));
        }
    }
}
