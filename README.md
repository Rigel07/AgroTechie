# AgroTechie
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isLoading = false;
  String _errorMessage = '';

  Future<void> _registerUser() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final response = await http.post(
        Uri.parse('http://your_backend_url/register'),
        body: jsonEncode({
          'username': _usernameController.text,
          'password': _passwordController.text
        }),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 201) {
        // User registered successfully
        Navigator.pushNamed(context, '/home');
      } else {
        _errorMessage = 'Registration failed: ${jsonDecode(response.body)['error']}';
      }
    } catch (e) {
      _errorMessage = 'An error occurred: $e';
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _loginUser() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final response = await http.post(
        Uri.parse('http://your_backend_url/login'),
        body: jsonEncode({
          'username': _usernameController.text,
          'password': _passwordController.text
        }),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        // Login successful
        final data = jsonDecode(response.body);
        final token = data['token'];
        // Store the token for future requests
        await _updateLocation(token);
        Navigator.pushNamed(context, '/home');
      } else {
        _errorMessage = 'Login failed: ${jsonDecode(response.body)['error']}';
      }
    } catch (e) {
      _errorMessage = 'An error occurred: $e';
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _updateLocation(String token) async {
    try {
      final position = await Geolocator.getCurrentPosition();
      final latitude = position.latitude;
      final longitude = position.longitude;

      final response = await http.post(
        Uri.parse('http://your_backend_url/update-location'),
        body: jsonEncode({
          'location': '${latitude},${longitude}'
        }),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
      );

      if (response.statusCode != 200) {
        print('Error updating location: ${jsonDecode(response.body)['error']}');
      }
    } catch (e) {
      print('Error getting location: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Your login form widgets here
            TextField(
              controller: _usernameController,
              decoration: InputDecoration(labelText: 'Username'),
            ),
            TextField(
              controller: _passwordController,
              decoration: InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            ElevatedButton(
              onPressed: _isLoading ? null : _loginUser,
              child: Text('Login'),
            ),
            ElevatedButton(
              onPressed: _isLoading ? null : _registerUser,
              child: Text('Register'),
            ),
            Text(_errorMessage, style: TextStyle(color: Colors.red)),
            // Location permission request widget
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                final permission = await Geolocator.requestLocationPermission();
                if (permission == LocationPermission.denied) {
                  print('Location permission denied');
                } else if (permission == LocationPermission.deniedForever) {
                  print('Location permission denied forever');
                } else {
                  _updateLocation();
                }
              },
              child: Text('Allow Location'),
            )
          ],
        ),
      ),
    );
  }
}
