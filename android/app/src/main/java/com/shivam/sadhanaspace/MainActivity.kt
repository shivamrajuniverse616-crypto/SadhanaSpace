package com.shivam.sadhanaspace

import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.Firebase
import com.google.firebase.analytics.analytics

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var analytics: FirebaseAnalytics

    // TODO: Replace with your actual deployed URL
    private val WEBSITE_URL = "https://sadhanaspacehq.web.app" 

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        analytics = Firebase.analytics

        webView = WebView(this)
        setContentView(webView)

        setupWebView()
        
        if (savedInstanceState == null) {
            webView.loadUrl(WEBSITE_URL)
        } else {
            webView.restoreState(savedInstanceState)
        }
    }

    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            userAgentString = userAgentString + " SadhanaSpaceApp"
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                if (url != null && url.contains(WEBSITE_URL)) {
                    return false // Let WebView handle it
                }
                // Here you could handle external links by opening a browser intent
                return false 
            }
        }
        
        webView.webChromeClient = WebChromeClient()
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }
    
    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        webView.restoreState(savedInstanceState)
    }
}
