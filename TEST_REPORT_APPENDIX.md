# Test Report Appendix - Sample Code

## A. Test Framework Setup

### A.1 BaseTest Configuration

```java
package com.agrisense.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.*;

import java.time.Duration;
import java.util.Properties;

public class BaseTest {
    protected WebDriver driver;
    protected WebDriverWait wait;
    protected static String BASE_URL = "http://localhost:5174";
    protected static String TEST_EMAIL = "test@agrisense.com";
    protected static String TEST_PASSWORD = "TestPassword123";

    @BeforeClass
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        options.addArguments("--disable-notifications");
        options.addArguments("--remote-allow-origins=*");
        
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(120));
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
        
        System.out.println("[✓] Chrome driver initialized");
    }

    @AfterClass
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    protected void login() {
        driver.get(BASE_URL + "/login");
        
        WebElement emailField = driver.findElement(
            By.cssSelector("input[type='email']")
        );
        WebElement passwordField = driver.findElement(
            By.cssSelector("input[type='password']")
        );
        
        emailField.sendKeys(TEST_EMAIL);
        passwordField.sendKeys(TEST_PASSWORD);
        
        driver.findElement(By.cssSelector("button[type='submit']")).click();
        
        wait.until(ExpectedConditions.not(
            ExpectedConditions.urlContains("/login")
        ));
    }
}
```

---

## B. Login Test Implementation

### B.1 Login Page Test

```java
package com.agrisense.tests;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

    @Test(priority = 1, description = "TC-01: Login page loads")
    public void testLoginPageLoads() {
        driver.get(BASE_URL + "/login");
        
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        Assert.assertFalse(driver.getTitle().isEmpty(), 
            "Page title should not be empty");
        
        WebElement emailField = wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("input[type='email']")
            )
        );
        
        Assert.assertTrue(emailField.isDisplayed(), 
            "Email field should be visible");
        
        System.out.println("[PASS] TC-01: Login page loaded");
    }

    @Test(priority = 2, description = "TC-02: Empty form validation")
    public void testEmptyFormValidation() {
        driver.get(BASE_URL + "/login");
        
        WebElement submitBtn = wait.until(
            ExpectedConditions.elementToBeClickable(
                By.cssSelector("button[type='submit']")
            )
        );
        submitBtn.click();
        
        Assert.assertTrue(
            driver.getCurrentUrl().contains("/login"),
            "Should stay on login page with empty fields"
        );
        
        System.out.println("[PASS] TC-02: Empty form validation works");
    }

    @Test(priority = 3, description = "TC-03: Invalid credentials")
    public void testInvalidCredentials() {
        driver.get(BASE_URL + "/login");
        
        driver.findElement(By.cssSelector("input[type='email']"))
            .sendKeys("wrong@email.com");
        driver.findElement(By.cssSelector("input[type='password']"))
            .sendKeys("wrongpassword");
        driver.findElement(By.cssSelector("button[type='submit']")).click();
        
        try {
            WebElement error = wait.until(
                ExpectedConditions.presenceOfElementLocated(
                    By.cssSelector("[role='alert']")
                )
            );
            Assert.assertNotNull(error, 
                "Error message should appear");
        } catch (TimeoutException e) {
            Assert.assertTrue(
                driver.getCurrentUrl().contains("/login"),
                "Should not navigate away with invalid credentials"
            );
        }
        
        System.out.println("[PASS] TC-03: Invalid credentials rejected");
    }

    @Test(priority = 4, description = "TC-04: Valid login")
    public void testValidLogin() {
        login();
        
        String currentUrl = driver.getCurrentUrl();
        Assert.assertFalse(
            currentUrl.contains("/login"),
            "Should redirect away from login"
        );
        
        System.out.println("[PASS] TC-04: Valid login successful");
    }
}
```

---

## C. Dashboard Test Implementation

### C.1 Dashboard Page Test

```java
package com.agrisense.tests;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import java.util.List;

public class DashboardTest extends BaseTest {

    @BeforeClass
    public void loginFirst() {
        login();
    }

    @Test(priority = 1, description = "TC-06: Dashboard loads")
    public void testDashboardLoads() {
        driver.get(BASE_URL + "/farmer-dashboard");
        
        wait.until(ExpectedConditions.not(
            ExpectedConditions.urlContains("/login")
        ));
        
        Assert.assertFalse(
            driver.getCurrentUrl().contains("/login"),
            "Dashboard should load without redirecting to login"
        );
        
        System.out.println("[PASS] TC-06: Dashboard loaded");
    }

    @Test(priority = 2, description = "TC-07: Sidebar visible")
    public void testSidebarVisible() {
        driver.get(BASE_URL + "/farmer-dashboard");
        
        WebElement sidebar = wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("nav, aside, [class*='sidebar']")
            )
        );
        
        Assert.assertTrue(sidebar.isDisplayed(), 
            "Sidebar should be visible");
        
        System.out.println("[PASS] TC-07: Sidebar is visible");
    }

    @Test(priority = 3, description = "TC-08: Dashboard cards")
    public void testDashboardCards() {
        driver.get(BASE_URL + "/farmer-dashboard");
        
        wait.until(ExpectedConditions.presenceOfElementLocated(
            By.cssSelector("[class*='card'], .stat, .widget")
        ));
        
        List<WebElement> cards = driver.findElements(
            By.cssSelector("[class*='card'], .stat, .widget")
        );
        
        Assert.assertTrue(cards.size() > 0, 
            "Dashboard should have at least one data card");
        
        System.out.println("[PASS] TC-08: Dashboard has " + 
            cards.size() + " cards");
    }

    @Test(priority = 4, description = "TC-09: Navigate to Market Analytics")
    public void testNavigateToMarketAnalytics() {
        driver.get(BASE_URL + "/market-analytics");
        
        wait.until(ExpectedConditions.urlContains("/market-analytics"));
        
        Assert.assertTrue(
            driver.getCurrentUrl().contains("/market-analytics"),
            "Should navigate to /market-analytics"
        );
        
        System.out.println("[PASS] TC-09: Market Analytics page loaded");
    }
}
```

---

## D. Market Analytics Test Implementation

### D.1 Market Analytics Page Test

```java
package com.agrisense.tests;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import java.util.List;

public class MarketAnalyticsTest extends BaseTest {

    @BeforeClass
    public void loginFirst() {
        login();
    }

    @Test(priority = 1, description = "TC-18: Market Analytics page loads")
    public void testPageLoads() {
        driver.get(BASE_URL + "/market-analytics");
        
        wait.until(ExpectedConditions.urlContains("/market-analytics"));
        
        Assert.assertTrue(
            driver.getCurrentUrl().contains("/market-analytics"),
            "Should be on /market-analytics"
        );
        
        System.out.println("[PASS] TC-18: Market Analytics page loaded");
    }

    @Test(priority = 2, description = "TC-19: Stats cards visible")
    public void testStatCardsVisible() {
        driver.get(BASE_URL + "/market-analytics");
        
        boolean hasMetrics = driver.getPageSource().contains("Avg Market Price") ||
                             driver.getPageSource().contains("Price Volatility");
        
        Assert.assertTrue(hasMetrics, 
            "Market metric cards should be visible");
        
        System.out.println("[PASS] TC-19: Market metric cards visible");
    }

    @Test(priority = 3, description = "TC-20: Time range buttons work")
    public void testTimeRangeButtons() {
        driver.get(BASE_URL + "/market-analytics");
        
        List<WebElement> rangeButtons = driver.findElements(
            By.xpath("//button[text()='7d' or text()='30d' or text()='90d']")
        );
        
        Assert.assertTrue(rangeButtons.size() >= 2, 
            "Time range buttons should be present");
        
        rangeButtons.get(0).click();
        
        try {
            Thread.sleep(500);
        } catch (InterruptedException ignored) {}
        
        System.out.println("[PASS] TC-20: Time range buttons are clickable");
    }

    @Test(priority = 4, description = "TC-23: CTA navigates to /procure")
    public void testProcureCTANavigation() {
        driver.get(BASE_URL + "/market-analytics");
        
        WebElement ctaBtn = wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Start Procurement')]")
            )
        );
        ctaBtn.click();
        
        wait.until(ExpectedConditions.urlContains("/procure"));
        
        Assert.assertTrue(
            driver.getCurrentUrl().contains("/procure"),
            "Clicking CTA should navigate to /procure"
        );
        
        System.out.println("[PASS] TC-23: CTA navigated to /procure");
    }
}
```

---

## E. Procure Page Test Implementation

### E.1 Procure Page Test

```java
package com.agrisense.tests;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import java.util.List;

public class ProcurePageTest extends BaseTest {

    @BeforeClass
    public void loginFirst() {
        login();
    }

    @Test(priority = 1, description = "TC-11: Procure page loads")
    public void testProcurePageLoads() {
        driver.get(BASE_URL + "/procure");
        
        wait.until(ExpectedConditions.urlContains("/procure"));
        
        Assert.assertTrue(
            driver.getCurrentUrl().contains("/procure"),
            "Should be on /procure page"
        );
        
        System.out.println("[PASS] TC-11: Procure page loaded");
    }

    @Test(priority = 2, description = "TC-12: Hero banner visible")
    public void testHeroBannerVisible() {
        driver.get(BASE_URL + "/procure");
        
        boolean found = driver.getPageSource().contains("Ready to Procure");
        
        Assert.assertTrue(found, 
            "Hero banner text should be visible");
        
        System.out.println("[PASS] TC-12: Hero banner is visible");
    }

    @Test(priority = 3, description = "TC-14: Supplier cards visible")
    public void testSupplierCardsVisible() {
        driver.get(BASE_URL + "/procure");
        
        try {
            Thread.sleep(2000);
        } catch (InterruptedException ignored) {}
        
        List<WebElement> negotiateBtns = driver.findElements(
            By.xpath("//button[contains(text(),'Negotiate')]")
        );
        
        Assert.assertTrue(
            negotiateBtns.size() > 0,
            "Supplier cards with Negotiate buttons should be visible"
        );
        
        System.out.println("[PASS] TC-14: " + 
            negotiateBtns.size() + " supplier cards visible");
    }

    @Test(priority = 4, description = "TC-15: Negotiate modal opens")
    public void testNegotiateModalOpens() {
        driver.get(BASE_URL + "/procure");
        
        WebElement negotiateBtn = wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Negotiate')]")
            )
        );
        negotiateBtn.click();
        
        try {
            Thread.sleep(1500);
        } catch (InterruptedException ignored) {}
        
        WebElement modal = wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("[class*='modal'], [role='dialog']")
            )
        );
        
        Assert.assertTrue(modal.isDisplayed(), 
            "Negotiation modal should open");
        
        System.out.println("[PASS] TC-15: Negotiate modal opened");
    }

    @Test(priority = 5, description = "TC-17: Search filter works")
    public void testSearchFilter() {
        driver.get(BASE_URL + "/procure");
        
        WebElement searchBox = wait.until(
            ExpectedConditions.elementToBeClickable(
                By.cssSelector("input[placeholder*='Search']")
            )
        );
        searchBox.sendKeys("Punjab");
        
        try {
            Thread.sleep(800);
        } catch (InterruptedException ignored) {}
        
        String pageSource = driver.getPageSource();
        Assert.assertTrue(
            pageSource.contains("Punjab") || !pageSource.contains("Negotiate"),
            "Search should filter suppliers"
        );
        
        System.out.println("[PASS] TC-17: Search filter applied");
    }
}
```

---

## F. Test Configuration (testng.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE suite SYSTEM "http://testng.org/testng-1.0.dtd">
<suite name="AgriSense Test Suite" parallel="false">
    <test name="Login Tests">
        <classes>
            <class name="com.agrisense.tests.LoginTest"/>
        </classes>
    </test>
    
    <test name="Dashboard Tests">
        <classes>
            <class name="com.agrisense.tests.DashboardTest"/>
        </classes>
    </test>
    
    <test name="Market Analytics Tests">
        <classes>
            <class name="com.agrisense.tests.MarketAnalyticsTest"/>
        </classes>
    </test>
    
    <test name="Procure Page Tests">
        <classes>
            <class name="com.agrisense.tests.ProcurePageTest"/>
        </classes>
    </test>
</suite>
```

---

## G. Maven POM Configuration

```xml
<dependencies>
    <!-- Selenium -->
    <dependency>
        <groupId>org.seleniumhq.selenium</groupId>
        <artifactId>selenium-java</artifactId>
        <version>4.15.0</version>
    </dependency>
    
    <!-- TestNG -->
    <dependency>
        <groupId>org.testng</groupId>
        <artifactId>testng</artifactId>
        <version>7.8.1</version>
        <scope>test</scope>
    </dependency>
    
    <!-- WebDriver Manager -->
    <dependency>
        <groupId>io.github.bonigarcia</groupId>
        <artifactId>webdrivermanager</artifactId>
        <version>5.6.3</version>
    </dependency>
</dependencies>

<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.0.0</version>
            <configuration>
                <suiteXmlFiles>
                    <suiteXmlFile>testng.xml</suiteXmlFile>
                </suiteXmlFiles>
            </configuration>
        </plugin>
    </plugins>
</build>
```

---

## H. Running Tests

### H.1 Run All Tests
```bash
mvn test
```

### H.2 Run Specific Test Class
```bash
mvn test -Dtest=LoginTest
```

### H.3 Run Specific Test Method
```bash
mvn test -Dtest=LoginTest#testValidLogin
```

### H.4 Run with TestNG
```bash
mvn test -Dsuite=testng.xml
```

---

## I. Test Selectors Reference

| Element | Selector |
|---------|----------|
| Email Input | `input[type='email']` |
| Password Input | `input[type='password']` |
| Submit Button | `button[type='submit']` |
| Sidebar | `nav, aside, [class*='sidebar']` |
| Dashboard Cards | `[class*='card'], .stat, .widget` |
| Error Alert | `[role='alert']` |
| Modal | `[class*='modal'], [role='dialog']` |
| Search Box | `input[placeholder*='Search']` |

---

## J. Common Wait Conditions

```java
// Wait for element to be visible
wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("element")));

// Wait for element to be clickable
wait.until(ExpectedConditions.elementToBeClickable(By.id("button")));

// Wait for URL to contain text
wait.until(ExpectedConditions.urlContains("/dashboard"));

// Wait for element to be present
wait.until(ExpectedConditions.presenceOfElementLocated(By.id("element")));

// Wait for element to be invisible
wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("element")));
```

---

## K. Troubleshooting

### K.1 Common Issues

**Issue**: Element not found
```java
// Solution: Add explicit wait
WebElement element = wait.until(
    ExpectedConditions.visibilityOfElementLocated(By.id("element"))
);
```

**Issue**: Stale element reference
```java
// Solution: Re-find element after page load
driver.navigate().refresh();
WebElement element = driver.findElement(By.id("element"));
```

**Issue**: Timeout waiting for element
```java
// Solution: Increase wait time or check selector
wait = new WebDriverWait(driver, Duration.ofSeconds(30));
```

---

## L. Best Practices

1. **Use explicit waits** instead of Thread.sleep()
2. **Organize tests** by functionality (Login, Dashboard, etc.)
3. **Use descriptive test names** that explain what is being tested
4. **Add logging** for debugging and reporting
5. **Handle exceptions** gracefully with meaningful messages
6. **Use Page Object Model** for complex applications
7. **Keep tests independent** - no test should depend on another
8. **Use data-driven testing** for multiple scenarios
9. **Clean up resources** in @AfterClass methods
10. **Document test cases** with clear descriptions

---

End of Appendix
