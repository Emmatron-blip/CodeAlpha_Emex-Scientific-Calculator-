package com.emex.calculator;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

    private WebView calculator;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        calculator = new WebView(this);

        WebSettings settings = calculator.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);

        calculator.setWebViewClient(new WebViewClient());

        setContentView(calculator);

        calculator.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (calculator.canGoBack()) {
            calculator.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
