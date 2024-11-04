$(document).ready(function () {
    pagename = location.href.substring(location.href.lastIndexOf('/') + 1);
    if (pagename == "linux.html") {
        $("#debian-install-code").hide()
    } else if (pagename == "download.html") {
        $(".downloads-content").hide()
    }
    $("#pre_release").hide();
    $("#experimental_release").hide();

    function find_asset_url(release, os, architecture) {
        if (release == undefined) return undefined;

        os = os.toLowerCase();
        let assets = release["assets"];
        for (var i = 0; i < assets.length; i++) {
            let name = assets[i]["name"];
            if (name.includes("debug"))
                 continue;

            if (os == "macos" && name.endsWith('.dmg'))
                return assets[i]["browser_download_url"];
            if (os == "windows" && architecture == "amd64" && name.endsWith('x64.exe'))
                return assets[i]["browser_download_url"];
            if (os == "windows" && architecture == "x86" && name.endsWith('x86.exe'))
                return assets[i]["browser_download_url"];
            if (os == "linux" && architecture == "amd64" && name.endsWith('x64.deb'))
                return assets[i]["browser_download_url"];
            if (os == "linux" && architecture == "arm64" && name.endsWith('aarch64.deb'))
                return assets[i]["browser_download_url"];
            if (os == "linux" && name.endsWith('all.deb'))
                return assets[i]["browser_download_url"];
        }
    }

    function update_page(stablerelease, prevrelease, prerelease, experimental_release) {
        if (typeof (isfront) !== 'undefined') {
            var parser = new UAParser();
            var osName = parser.getOS().name.toLowerCase();
            var architecture = parser.getCPU().architecture;

            // set download URLs
            if (osName == "windows") {
                $("#download_os").html("For Windows 7/8/10 (64-bit)");

                let stable = find_asset_url(stablerelease, osName, architecture);
                $("#main_download_url").attr("href", stable);
                $("#footer_download_url").attr("href", stable);
                $("#pre_release_download_url").attr("href", find_asset_url(prerelease, osName, architecture));

                let exp32 = find_asset_url(experimental_release, osName, 'x86');
                let exp64 = find_asset_url(experimental_release, osName, 'amd64');
                if (exp32 != undefined || exp64 != undefined) {
                    $("#experimental_release").show();
                    const userAgent = navigator.userAgent;
                    if (userAgent.indexOf("WOW64") !== -1 || userAgent.indexOf("Win64") !== -1) {
                        $("#experimental_release_download_url").attr("href", exp64);
                    } else {
                        $("#experimental_release_download_url").attr("href", exp32);
                    }
                }
            } else if (osName == "macos") {
                $("#download_os").html("For macOS (Yosemite or later)");

                let stable = find_asset_url(stablerelease, osName);
                $("#main_download_url").attr("href", stable);
                $("#footer_download_url").attr("href", stable);
                $("#pre_release_download_url").attr("href", find_asset_url(prerelease, osName));

                let exp = find_asset_url(experimental_release, osName);
                if (exp != undefined) {
                    $("#experimental_release").show();
                    $("#experimental_release_download_url").attr("href", exp);
                }
            } else if (jQuery.inArray(osName, new Array('kubuntu', 'xubuntu', 'lubuntu', 'ubuntu', 'gentoo', 'fedora', 'mandriva', 'redhat', 'suse', 'debian', 'slackware', 'arch', 'linux')) !== -1) {
                $("#download_os").html("For Linux");

                let stable = find_asset_url(stablerelease, "linux", architecture);
                $("#main_download_url").attr("href", stable);
                $("#footer_download_url").attr("href", stable);
                $("#pre_release_download_url").attr("href", find_asset_url(prerelease, "linux", architecture));
                $("#instructions").html("Installation instructions for Linux");
                $("#instructions").css("display", "block");
                $("#instructions").attr("href", "./linux.html");

                let exp = find_asset_url(experimental_release, "linux", architecture);
                if (exp != undefined) {
                    $("#experimental_release").show();
                    $("#experimental_release_download_url").attr("href", exp);
                }
            } else {
                $("#download_os").html("Unknown OS");
                $("#main_download_url").attr("href", "download.html");
                $("#footer_download_url").attr("href", "download.html");
            }
        } else if (pagename == "linux.html") {
            let stable = find_asset_url(stablerelease, "linux", "amd64");
            $("#linux-content-header").text("Latest release - Tribler " + stablerelease["name"].substring(1));
            $("#debian-download-url").attr("href", stable);
            $("#debian-download-url").text("Download " + stablerelease["name"].substring(1));
            $("#tribler-source-url").attr("href", stablerelease["tarball_url"]);
            $("#tribler-source-tree-url").attr("href", 'https://github.com/Tribler/tribler/tree/' + stablerelease['tag_name']);

            $("#debian-install-code-url").text(find_asset_url(stablerelease, "linux"));
            $("#debian-install-code-file").text("./" + stable.split(/(\\|\/)/g).pop());
            $("#debian-install-code").show();
        } else if (pagename == "download.html") {
            $("#download-url-win64").attr("href", find_asset_url(stablerelease, "windows", "amd64"));
            $("#download-url-win32").attr("href", find_asset_url(stablerelease, "windows", "x86"));
            $("#download-url-mac").attr("href", find_asset_url(stablerelease, "macos"));
            $("#download-url-linux").attr("href", find_asset_url(stablerelease, "linux", "amd64"));
            $("#tribler-source-url").attr("href", stablerelease["zipball_url"]);
            $(".tribler-source-tree-url").attr("href", 'https://github.com/Tribler/tribler/tree/' + stablerelease['tag_name']);
            $(".downloads-content").show()
            $("#github-compare-url").attr("href", 'https://github.com/Tribler/tribler/compare/' + prevrelease['tag_name'] + '...' + stablerelease['tag_name'])
        }
    }

    // Fetch the first release page of the API to show the latest stable release.
    $.get("https://api.github.com/repos/Tribler/tribler/releases", function (data) {
        var stablerelease = undefined;
        var prevrelease = undefined;
        var prerelease = undefined;
        $.each(data, function (index, release) {
            if (index == 0 && release["prerelease"] && !prerelease) {
                // we found a prerelease;
                prerelease = release;
                $("#pre_release").show();
                $("#pre_release_download_url").text("Download Tribler " + release["name"].substring(1));
            }
            if (!release["prerelease"] && !stablerelease) {
                // we found a stable release; update fields
                stablerelease = release;
                $("#main_download_url").text("Download Tribler " + release["name"].substring(1) + " (stable)");
                $("#footer_download_url").text("Download Tribler " + release["name"].substring(1) + " (stable)");
            } else if (!release["prerelease"] && !prevrelease && stablerelease) {
                prevrelease = release;
            }
        });

        // Fetch experimental release
        let experimental_release = undefined;

        // DISABLED, re-enable by pointing to some repository here:
        //$.get("https://api.github.com/repos/qstokkink/TriblerExperimental/releases", function (data) {
        //    experimental_release = data[0];
        //    update_page(stablerelease, prevrelease, prerelease, experimental_release);
        //});

        update_page(stablerelease, prevrelease, prerelease, experimental_release);
    });

    // Fetch all the releases from the API and get aggregate sum of downloads.
    /* Commenting out the following code because this code can sometimes cause GH API to timeout
    * in which case we cannot show the proper download URL as well*/
    /*
    var releases_page = 1;
    var max_page = 10;
    var next_page_exists = true;
    var total_downloads = 0;
    do{
        $.get("https://api.github.com/repos/Tribler/tribler/releases?page="+releases_page, function (releases) {
            next_page_exists = releases.length != 0
            $.each(releases, function (index, release) {
                $.each(release["assets"], function (index2, asset) {
                    total_downloads += asset["download_count"];
                    $("#total_downloads_all_versions").html(total_downloads.toLocaleString());
                });
            });
        });
        releases_page += 1
    }while(next_page_exists && releases_page < max_page);
    */

});