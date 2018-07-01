/**
 * The PageManager object provides all functionality for the page manager table and "New Post" window.
 */
var PageManager = {
    /*
        App State Objects
    */
    _userID: null,
    _userPagesInfo: [],
    _currentPagePosts: [],
    _currentPage: null,
    _currentPost: null,

    /*
        Login Functions
    */
    checkLogin: function() {
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });
    },
    addPermissions: function(){
        FB.login(function(response) {
            console.log(response);
        },
        {
            scope: 'email, read_insights, manage_pages, pages_show_list, publish_pages, public_profile',
            return_scopes: true
        });
    },
    statusChangeCallback : function(response) {
        if (response.status === 'connected') {
          $("#loginModal").modal('hide');
          $("#logoutButton").show();
            
          // Logged into your app and Facebook.
          this._userID = response.authResponse.userID;
          this.addPermissions();
          this._saveSessionInfo(this._userID, response, function(){});
          this.loadData();
        } else {
            $("#logoutButton").hide();
            $("#loginModal").modal({show:true});
        }
    },
    checkLoginState: function() {
        FB.getLoginStatus(function(response) {
          this.PageManager.statusChangeCallback(response);
        });
    },
    logout: function(){
        $("#logoutModal").modal('hide');
        FB.logout(function(response) {
            console.log('Person is now logged out');
            console.log(response);
            window.location.reload();
        });
    },

    /*
        Load Pages Information on Login
    */
    loadData: function() {
        console.log('Welcome!  Fetching your information.... ');

        FB.api('/me', function(response) {
          console.log('Successful login for: ' + response.name);
            document.getElementById('spanUserName').innerHTML = response.name;
        });

        PageManager.render();
    },
    render: function() {
        this._renderPagesGrid();
        $("#topbreadcrumb").empty();
        $("#topbreadcrumb").append("" + 
        "<li class=\"breadcrumb-item\">" + 
          "<a href=\"#\" onclick=\"javascript:PageManager.loadData()\">Dashboard</a>" + 
        "</li>"
        );
        $("#topbreadcrumb").append("<li id=\"pageItemBreadCrumb\" class=\"breadcrumb-item active\"></li>");
        $("#writePost").on("click", $.proxy(this.showNewPost, this));
    },

    /*
        Edit Post Functions
    */
    showPostModal: function(postId) {
        this._currentPost = postId;
        if(this._currentPagePosts != null && this._currentPagePosts != undefined){
            this._currentPagePosts.forEach(function(post) {
                if(post.id === postId){
                    document.getElementById("editPostMessage").value = post.message;
                    document.getElementById("numberOfComments").innerHTML = "<i class=\"fa fa-comment\"></i>  " +  post.numberOfComments + " Comments";
                    document.getElementById("numberOfReactions").innerHTML = "<i class=\"fa fa-users\"></i>  " +  post.numberOfReactions + " Reactions";
                    if(post.isPublished){
                        $("#postInsightsSections").show();
                        $("#save-draft-post").hide();
                    }
                    else
                    {
                        $("#postInsightsSections").hide();
                    }
                    return;
                }
            });
        }
        this.configureShowPostModal();
    },
    configureShowPostModal: function() {
        $("#editPostMessage").attr("readonly", true);
        $("#edit-draft-post").attr("hidden", false);
        $("#save-draft-post").attr("hidden", true);
        $("#edit-post-publish").attr("hidden", true);
        $('#editPostModal').modal({show:true});
    },
    enableEditPost: function(){
        $("#editPostMessage").attr("readonly", false);
        $("#edit-draft-post").attr("hidden", true);
        $("#save-draft-post").attr("hidden", false);
        $("#edit-post-publish").attr("hidden", false);
    },
    savePostUpdate: function(isPublished){
        var postContent = $("#editPostMessage").val();
        $("#editPostMessage").attr("readonly", true);
        $("#save-draft-post").attr("hidden", true);
        $("#edit-post-publish").attr("hidden", true);

        callback = $.proxy(function(pageId, pageName, pageAccessToken) {
            $('#editPostModal').modal('toggle');
            document.getElementById("editPostMessage").value = "";
            this.openPage(pageId, pageName, pageAccessToken);
        }, this);

        this._updatePost(this._currentPost, this._currentPage.id, this._currentPage.name, this._currentPage.accessToken, postContent, isPublished, callback);
    },
    /*
        Create New Post functions
    */
    showNewPost: function() {
        $('#newPostModal').modal({show:true});
    },
    createNewPost: function(isPublished){
        var postContent = $("#newPostMessage").val(),
        callback = $.proxy(function(pageId, pageName, pageAccessToken) {
            $('#newPostModal').modal('toggle');
            document.getElementById("newPostMessage").value = "";
            this.openPage(pageId, pageName, pageAccessToken);
        }, this);

        // FIX:accessToken fix.
        this._createPost(this._currentPage.id, this._currentPage.name, this._currentPage.accessToken, postContent, isPublished, callback);
    },

    /*
        Show Page List
    */
    _renderPagesGrid: function() {
        this._readPages(this._userID, this._renderPagesGridCallback);
    },

    _renderPagesGridCallback: function(data){
        $("#pagesList").empty();

        this.PageManager._userPagesInfo = data;

        $("#pagesList").html("" +
            "<ul class='sidenav-second-level collapse show' id='collapseExamplePages'>" + 
                data.reduce(function(x, y) {
                    return x + "" +
                        "<li>" +
                            "<a href=\"javascript:PageManager.openPage('" + y.id + "','" + y.name + "','" + y.accessToken + "')\">" + $("<div />").text(y.name).html()  + "</a>" +
                        "</li>";
                }, "") +
            "</ul>");

        //$("#pages-accordion").attr();

        $("#spa-container").empty();
        $("#spa-container").append("<div id=\"pagesDashboard\" class=\"row\"></div>");

        $("#pagesDashboard").html("" +
            data.reduce(function(x, y) {
                return x + "" +
                   "<div class=\"col-xl-3 col-sm-6 mb-3\">" +
                      "<div class=\"card text-black o-hidden h-100\">" + 
                        "<div class=\"card-body\">" + 
                          "<div class=\"card-body-icon\">" +
                            "<i class=\"fa fa-fw fa-list\"></i>" +
                          "</div>" + 
                          "<div class=\"mr-5\">" + y.name + "</div>" + 
                        "</div>" +
                        "<a class=\"card-footer text-black clearfix small z-1\" href=\"javascript:PageManager.openPage('" + y.id + "','" + y.name + "','" + y.accessToken + "')\">" +
                          "<span class=\"float-left\">View Details</span>" + 
                          "<span class=\"float-right\">" + 
                            "<i class=\"fa fa-angle-right\"></i>" + 
                          "</span>" + 
                        "</a>" +
                      "</div>" +
                    "</div>"
                }, 
            "")
        );
    },

    /**
     * Sets up the grid of existing posts
     */
    openPage : function(pageId, pageName, pageAccessToken){
        this._currentPage = {};
        this._currentPagePosts = [];
        if(this._userPagesInfo != null){
            this._userPagesInfo.forEach(function(page) {
                if(page.id == pageId){
                    this.PageManager._currentPage = page;
                    document.getElementById("pageItemBreadCrumb").innerHTML = pageName;
                    $("#spa-container").empty();
                    $("#spa-container").append("<div id=\"pageSummary\"></div>");
                    $("#spa-container").append("<div id=\"newPost\"><a class=\"btn btn-primary\" style=\"float:right\" href=\"#\" id=\"toggleNavPosition\" onclick=\"PageManager.showNewPost();\">Create New Post</a></div></br>");
                    $("#spa-container").append("<div><div id=\"postsGrid\" style=\"float:left;width:50%;margin-right:2%\"></div><div id=\"unpublishedPostsGrid\"></div></div>");
                    this.PageManager._renderPageSummary(this.PageManager._currentPage.id, this.PageManager._currentPage.name, this.PageManager._currentPage.accessToken);
                    this.PageManager._renderPostsGrid(this.PageManager._currentPage.id, this.PageManager._currentPage.name, this.PageManager._currentPage.accessToken, this.PageManager._currentPage.next);
                    this.PageManager._renderUnpublishedPostsGrid(this.PageManager._currentPage.id, this.PageManager._currentPage.name, this.PageManager._currentPage.accessToken, this.PageManager._currentPage.next);
                    return;
                }
            });
        }
    },
    _renderPostsGrid: function(pageId, pageName, pageAccessToken) {
        this._readPost(pageId, pageName, pageAccessToken, "", this._renderPostsGridCallback);
    },
    _renderUnpublishedPostsGrid: function(pageId, pageName, pageAccessToken) {
        this._readUnpublishedPost(pageId, pageName, pageAccessToken, "", this._renderUnpublishedPostsGridCallback);
    },
    loadMorePosts: function(isPublished) {
        if(isPublished)
        {
            this._readPost(
                this._currentPage.pageId, 
                this._currentPage.pageName, 
                this._currentPage.pageAccessToken, 
                this._currentPage.nextPageUrl, 
                this._renderPostsGridCallback);
        }
        else
        {
            this._readUnpublishedPost(
                this._currentPage.pageId, 
                this._currentPage.pageName, 
                this._currentPage.pageAccessToken,
                this._currentPage.nextUnpublishedPageUrl, 
                this._renderUnpublishedPostsGridCallback);
        }
    },
    _renderUnpublishedPostsGridCallback: function(pageId, pageName, pageAccessToken, data) {
        this.PageManager._currentPage.nextUnpublishedPageUrl = data.nextPageUrl;

        this.PageManager._currentPagePosts = this.PageManager._currentPagePosts.concat(data.data);

        $("#unpublishedPostsGrid").html(
            "</br>" +
            "<div class=\"card mb-3\">" + 
                "<div class=\"card-header\"><i class=\"fa fa-bell-o\"></i> Unpublished Posts</div>" + 
                "<div class=\"list-group list-group-flush small\">" +
                    this.PageManager._currentPagePosts.filter(post => post.isPublished === false).reduce(function(x, y) {
                        return x + "" +
                            "<a class=\"list-group-item list-group-item-action\" href=javascript:PageManager.showPostModal('" + y.id +  "')>" + 
                                "<div class=\"media\">" + 
                                  "<img class=\"d-flex mr-3 rounded-circle\" src=\"" + this.PageManager._currentPage.pictureUrl + "\" alt=\"\">" + 
                                  "<div class=\"media-body\">" + 
                                    "<p>" + y.message + "</p>" + 
                                    "<div class=\"text-muted smaller\">" + moment(y.datePosted).format("dddd, MMMM Do YYYY, h:mm:ss a") + "</div>" + 
                                  "</div>" + 
                                "</div>" + 
                            "</a>"
                    }, "") +
                    (this.PageManager._currentPage.nextUnpublishedPageUrl != null && this.PageManager._currentPage.nextUnpublishedPageUrl != undefined ?
                        "<a class=\"list-group-item list-group-item-action\" href=javascript:PageManager.loadMorePosts(false)>View more activity...</a>" : "" ) + 
                "</div>" +
            "</div>"
        );
    },
    _renderPostsGridCallback: function(pageId, pageName, pageAccessToken, data) {
        this.PageManager._currentPage.nextPageUrl = data.nextPageUrl;

        this.PageManager._currentPagePosts = this.PageManager._currentPagePosts.concat(data.data);

        $("#postsGrid").html(
            "</br>" +
            "<div class=\"card mb-3\">" + 
                "<div class=\"card-header\"><i class=\"fa fa-bell-o\"></i> Published Posts</div>" + 
                "<div class=\"list-group list-group-flush small\">" +
                    this.PageManager._currentPagePosts.filter(post => post.isPublished === true).reduce(function(x, y) {
                        return x + "" +
                            "<a class=\"list-group-item list-group-item-action\" href=javascript:PageManager.showPostModal('" + y.id +  "')>" + 
                                "<div class=\"media\">" + 
                                  "<img class=\"d-flex mr-3 rounded-circle\" src=\"" + this.PageManager._currentPage.pictureUrl + "\" alt=\"\">" + 
                                  "<div class=\"media-body\">" + 
                                    "<p>" + y.message + "</p>" + 
                                    "<div class=\"text-muted smaller\">" + moment(y.datePosted).format("dddd, MMMM Do YYYY, h:mm:ss a") + "</div>" + 
                                  "</div>" + 
                                "</div>" + 
                            "</a>"
                    }, "") +
                    (this.PageManager._currentPage.nextPageUrl != null && this.PageManager._currentPage.nextPageUrl != undefined ?
                        "<a class=\"list-group-item list-group-item-action\" href=javascript:PageManager.loadMorePosts(true)>View more activity...</a>" : "" ) + 
                "</div>" +
            "</div>"
        );
    },
    _renderPageSummary: function(pageId, pageName, pageAccessToken) {
        var callback = function(pageId, pageName, pageAccessToken, data) {
            $("#pageSummary").html(
            "<div class=\"row\">" + 
                data.reduce(function(x, y) {
                    return x + "" +
                        "<div class=\"col-xl-3 col-sm-6 mb-3\">" +
                          "<div class=\"card text-black o-hidden h-100\">"+
                            "<div class=\"card-body\">"+
                              "<div class=\"card-body-icon\">"+
                                "<i class=\"fa fa-fw fa-facebook-square\"></i>"+
                              "</div>"+
                              "<div class=\"mr-5\">" + y.values[0]["value"] + " " + y.title + "</div>"+
                            "</div>" + 
                          "</div>" +
                        "</div>"
                    }, "") +
            "</div>");
        };
        this._readPageSummary(pageId, pageName, pageAccessToken, callback);
    },

    /*
        Set of server calls
    */
    _saveSessionInfo: function(userInfo, sessionInfo, callback) {
        var url = PageManagerSettings.SaveSessionInfoUrl;

        return $.ajax({
            url: url,
            data: {
                userInfo : userInfo,
                sessionInfo : JSON.stringify(sessionInfo)
            },
            method: "POST",
            async: false,
            success: callback
        });
    },
    _createPost: function(pageId, pageName, pageAccessToken, postContent, isPublished, callback) {
        var url = PageManagerSettings.CreatePostUrl;

        $.ajax({
            url: url,
            data: {
                pageId: pageId,
                accessToken: pageAccessToken,
                postContent: postContent,
                isPublished: isPublished
            },
            method: "POST",
            pageId: pageId,
            pageName: pageName,
            pageAccessToken: pageAccessToken,
            success: function(){
                callback(this.pageId, this.pageName, this.pageAccessToken);
            }
        });
    },
    _updatePost: function(postId, pageId, pageName, pageAccessToken, postContent, isPublished, callback) {
        var url = PageManagerSettings.UpdatePostUrl;

        $.ajax({
            url: url,
            data: {
                postId: postId,
                pageId: pageId,
                accessToken: pageAccessToken,
                postContent: postContent,
                isPublished: isPublished
            },
            method: "POST",
            pageId: pageId,
            pageName: pageName,
            pageAccessToken: pageAccessToken,
            success: function(){
                callback(this.pageId, this.pageName, this.pageAccessToken);
            }
        });
    },
    _readUnpublishedPost: function(pageId, pageName, pageAccessToken, nextPageUrl, callback) {
        var url = PageManagerSettings.ReadUnpublishedPostUrl;
        $.ajax({
            url: url,
            data: {
                pageId: pageId,
                accessToken: pageAccessToken,
                nextPageUrl: nextPageUrl
            },
            pageId: pageId,
            pageName: pageName,
            pageAccessToken: pageAccessToken,
            method: "GET",
            success: function(response){
                callback(this.pageId, this.pageName, this.pageAccessToken, response);
            }
        });
    },
    _readPost: function(pageId, pageName, pageAccessToken, nextPageUrl, callback) {
        var url = PageManagerSettings.ReadPublishedPostUrl;

        $.ajax({
            url: url,
            data: {
                pageId: pageId,
                accessToken: pageAccessToken,
                nextPageUrl: nextPageUrl
            },
            pageId: pageId,
            pageName: pageName,
            pageAccessToken: pageAccessToken,
            method: "GET",
            success: function(response){
                callback(this.pageId, this.pageName, this.pageAccessToken, response);
            }
        });
    },
    _readPageSummary: function(pageId, pageName, pageAccessToken, callback) {
        var url = PageManagerSettings.ReadPageSummaryUrl;

        $.ajax({
            url: url,
            data: {
                pageId: pageId,
                accessToken: pageAccessToken
            },
            pageId: pageId,
            pageName: pageName,
            pageAccessToken: pageAccessToken,
            method: "GET",
            success: function(response){
                callback(this.pageId, this.pageName, this.pageAccessToken, response);
            }
        });
    },
    _readPages: function(_userID, callback) {
        var url = PageManagerSettings.ReadPagesUrl;

        $.ajax({
            url: url,
            data: {
                userInfo: _userID
            },
            method: "GET",
            success: function(data){
                callback(data);
            },
        });
    }
};

$(document).ready(function() {
    window.fbAsyncInit = function() {
    FB.init({
      appId            : '469552273498679',
      autoLogAppEvents : true,
      xfbml            : true,
      version          : 'v3.0'
    });

    FB.getLoginStatus(function(response) {
      PageManager.statusChangeCallback(response);
    });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
});

