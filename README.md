# apache-server-visual

An animated, beginner-friendly diagram that explains how to **create, configure and host a website with Apache HTTP Server (HTTPD) on an AWS EC2 instance**, told through Ravi, a shop owner launching his online shop.

**#Buildwithvinit** · Pure HTML, CSS and JavaScript · No dependencies · Works on GitHub Pages

## The story (analogies)

| Technical term | Ravi's world |
|---|---|
| AWS | Cloud city |
| EC2 | Rented shop building |
| Amazon Linux | Shop operating system |
| Apache HTTPD | Receptionist |
| Public IPv4 | Shop address |
| Port 80 | Entrance for HTTP visitors |
| Security Group | Door guard |
| Internet Gateway | Main entrance to the network |
| DocumentRoot | Website file storage shelf |
| index.html | Shop welcome page |
| HTTP request | Visitor asking for the website |
| HTTP response | Receptionist delivering the website |
| systemctl | Power controls |
| Access logs | Visitor register |
| Error logs | Problem register |

## The 10 steps

1. **AWS Cloud and EC2**: AWS Cloud, VPC, public subnet, Internet Gateway and an EC2 instance running Amazon Linux 2023.
2. **Connect to EC2**: the administrator connects with SSH or EC2 Instance Connect.
3. **Install Apache HTTPD**: the package manager delivers Apache.
4. **Start and enable Apache**: Apache starts and listens on port 80.
5. **Create the website file**: `index.html` goes into `/var/www/html/`.
6. **Configure the Security Group**: HTTP 80 open to visitors, SSH 22 restricted to the administrator's IP.
7. **Public IP and browser**: a visitor enters `http://PUBLIC-IP`; the request travels through the Internet Gateway and public subnet.
8. **Apache serves the website**: Apache reads `index.html` and returns `200 OK`; the page appears in the browser.
9. **Monitoring and troubleshooting**: a blocked request, the fix, then a successful request, plus the logs.
10. **Complete architecture**: the full round trip. HTTPS and a domain name are the optional production upgrades.

## All commands

```bash
# Step 2: connect
chmod 400 my-key.pem
ssh -i my-key.pem ec2-user@PUBLIC-IP

# Step 3: install
sudo dnf update -y
sudo dnf install httpd -y

# Step 4: start and enable
sudo systemctl enable --now httpd
sudo systemctl status httpd

# Step 5: create the website file
echo '<h1>Welcome to Ravi Shop</h1>' | sudo tee /var/www/html/index.html

# Step 6 (console): Security Group inbound rules
#   HTTP  TCP 80  0.0.0.0/0
#   SSH   TCP 22  YOUR-IP/32

# Step 7: open in a browser
#   http://PUBLIC-IP

# Step 8: test from the server
curl -i http://localhost

# Step 9: monitoring and troubleshooting
sudo systemctl status httpd
sudo ss -tlnp | grep ':80'
curl http://localhost
sudo journalctl -u httpd
sudo tail -f /var/log/httpd/access_log
sudo tail -f /var/log/httpd/error_log

# Step 10 (optional): HTTPS
sudo dnf install mod_ssl -y   # plus a real certificate and port 443 in the Security Group
```

## Packet legend (moving objects)

| Object | Meaning |
|---|---|
| Envelope | HTTP request |
| Document | HTML file |
| Green check | HTTP 200 response |
| Package | Apache installation |
| Lock | Security filtering |
| Red cross | Blocked connection |
| Magnifying glass | Troubleshooting |

Colours: blue = AWS and network, teal = EC2, purple = Apache, gold = HTTP requests, green = success, red = errors and blocked traffic.

## Controls

Left sidebar step buttons, Previous / Next, Auto-play (advances every 5 seconds), Reset, light/dark toggle. Arrow keys also change steps. Clicking a step shows everything introduced in earlier steps. `prefers-reduced-motion` is respected: objects are shown static and glow effects are off.

## Run locally

No build step. Either open `index.html` directly in a browser, or serve the folder:

```bash
cd apache-server-visual
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a GitHub repository and push these files to the `main` branch.
2. Go to **Settings > Pages**, set Source to **Deploy from a branch**, choose `main` and `/ (root)`, then Save.
3. After a minute your site is live at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

The `.nojekyll` file tells GitHub Pages to serve the files as they are.

## Project structure

```
apache-server-visual/
  index.html      page layout: sidebar, controls, legend, SVG stage, caption card
  css/style.css   theme variables, layout, glow animation, responsive rules
  js/app.js       diagram components, paths, moving objects, step content, controls
  .nojekyll
  LICENSE         MIT
  README.md
```

## Customization

All content lives in `js/app.js`:

- **Story text and commands**: edit the `STEPS` array (`t`, `sub`, `plain`, `tech`, `cmd`, `watch`).
- **Diagram parts**: edit `COMPS`. Each entry has `s` (first step shown), optional `e` (last step shown) and its SVG.
- **Travel routes**: edit `PATHS` (SVG path data in the 1100 x 620 viewBox).
- **Moving objects**: edit `movers(step)`. Each object has a `path`, an `icon`, a duration `dur` and an optional `win:[start,end]` window within the loop. `pos` is where it rests when reduced motion is on.
- **Colours**: the `C` object in `js/app.js` for the diagram, CSS variables in `css/style.css` for the page.
- **Font**: Bricolage Grotesque loads from Google Fonts in `index.html`; system fonts are the fallback.

## License

MIT. Built with #Buildwithvinit.
